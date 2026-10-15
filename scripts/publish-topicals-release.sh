#!/usr/bin/env bash
# ==============================================================================
# Publish IB Topical Past Papers Vault to GitHub Releases (v3.0-topicals)
#
# Generates zero-cost CDN streaming assets for:
#   - IB Physics (Themes A-E, 24 sub-topics)
#   - IB Chemistry (Structure & Reactivity S1-R3, 22 sub-topics)
#   - IB Mathematics AA/AI (Topics 1-5, 25 sub-topics)
#
# Asset naming format: ${subject}__${filename}
# Matches ThinkIB/app/api/past-papers/[...path]/route.ts CDN resolver.
# ==============================================================================

set -euo pipefail

REPO="${REPO:-fr3ddykru3g3r/ib-vault}"
TAG="${TAG:-v3.0-topicals}"
TITLE="IB Topical Past Papers Vault (Physics, Chemistry, Math)"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
VAULT_ROOT="$PROJECT_ROOT/public/vault"
STAGING_DIR="/tmp/ib-topicals-release-staging"

echo "======================================================================"
echo "🚀 IB TOPICAL PAST PAPERS RELEASE PUBLISHER"
echo "Target Repo:    $REPO"
echo "Release Tag:    $TAG"
echo "Project Root:   $PROJECT_ROOT"
echo "======================================================================"

# 1. Verify GitHub CLI Authentication
if ! command -v gh >/dev/null 2>&1; then
  echo "❌ Error: GitHub CLI ('gh') is not installed or not in PATH."
  exit 1
fi

echo "==> Verifying GitHub CLI authentication..."
if ! gh auth status >/dev/null 2>&1; then
  echo "❌ Error: 'gh' is not authenticated. Run 'gh auth login' first."
  exit 1
fi
echo "✓ GitHub CLI authenticated."

# 2. Check if local topical directories exist
SUBJECTS=("physics" "chemistry" "math")
TOTAL_LOCAL_PDFS=0

for subj in "${SUBJECTS[@]}"; do
  DIR="$VAULT_ROOT/${subj}-topicals"
  if [ -d "$DIR" ]; then
    COUNT=$(find "$DIR" -name "*.pdf" | wc -l | tr -d ' ')
    echo "✓ Found $COUNT PDFs in ${subj}-topicals"
    TOTAL_LOCAL_PDFS=$((TOTAL_LOCAL_PDFS + COUNT))
  else
    echo "⚠️ Warning: Directory $DIR not found. Skipping $subj."
  fi
done

if [ "$TOTAL_LOCAL_PDFS" -eq 0 ]; then
  echo "❌ Error: No topical PDFs found in $VAULT_ROOT/*-topicals."
  exit 1
fi

echo "==> Total topical PDFs to stage: $TOTAL_LOCAL_PDFS"

# 3. Ensure Release Exists on GitHub
echo "==> Ensuring GitHub release '$TAG' exists on $REPO..."
if ! gh release view "$TAG" --repo "$REPO" >/dev/null 2>&1; then
  echo "Creating release $TAG..."
  gh release create "$TAG" \
    --repo "$REPO" \
    --title "$TITLE" \
    --notes "Official zero-cost vector topical past papers vault for IB Physics (Themes A-E), Chemistry (Structure & Reactivity S1-R3), and Mathematics AA/AI (Topics 1-5). Sliced with PyMuPDF with crisp vector fidelity and paired markschemes."
  echo "✓ Release $TAG created."
else
  echo "✓ Release $TAG already exists."
fi

# 4. Stage Assets with Prefix: ${subject}__${filename}
echo "==> Staging assets into $STAGING_DIR..."
rm -rf "$STAGING_DIR"
mkdir -p "$STAGING_DIR"

STAGED_COUNT=0
for subj in "${SUBJECTS[@]}"; do
  DIR="$VAULT_ROOT/${subj}-topicals"
  if [ -d "$DIR" ]; then
    for pdf in "$DIR"/*.pdf; do
      [ -f "$pdf" ] || continue
      FILENAME="$(basename "$pdf")"
      STAGED_NAME="${subj}__${FILENAME}"
      ln -sf "$pdf" "$STAGING_DIR/$STAGED_NAME"
      STAGED_COUNT=$((STAGED_COUNT + 1))
    done
  fi
done

echo "✓ Successfully staged $STAGED_COUNT assets."

# 5. Upload Assets to GitHub Release
echo "==> Uploading $STAGED_COUNT assets to $TAG on $REPO (with --clobber)..."
# Upload in batches of 20 to avoid CLI argument list overflow or network timeouts
cd "$STAGING_DIR"
find . -name "*__*.pdf" | sed 's|^\./||' | xargs -n 20 gh release upload "$TAG" --repo "$REPO" --clobber

echo "======================================================================"
echo "✅ Topicals Release Publishing Complete!"
echo "Uploaded $STAGED_COUNT assets to: https://github.com/$REPO/releases/tag/$TAG"
echo "CDN Base URL: https://github.com/$REPO/releases/download/$TAG/<subject>__<file>.pdf"
echo "======================================================================"

# Clean up staging directory
rm -rf "$STAGING_DIR"
