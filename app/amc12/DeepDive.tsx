import guides from '@/data/amc12/deep-dives.json';
import { Tex } from './shared';
export default function DeepDive({topicId}:{topicId:string}){
  const guide=guides[topicId as keyof typeof guides];
  if(!guide)return null;
  return <section id="deep-dive" className="amc-deep-dive"><span className="section-label">Method workshop</span><h2>{guide.focus}</h2><Tex block>{guide.method}</Tex><h3>Before you commit to a method</h3><ul>{guide.checks.map((check,i)=><li key={i}><Tex>{check}</Tex></li>)}</ul><h3>Two problems to work through</h3><p>Try the question on paper before opening its solution. For each step, explain why it follows from the previous one.</p>{guide.examples.map((example,i)=><div key={i}><h3>{example.title}</h3><Tex block>{example.problem}</Tex><details><summary>Show the full reasoning</summary><ol>{example.steps.map((step,j)=><li key={j}><Tex>{step}</Tex></li>)}</ol><p><strong>Answer: </strong><Tex>{example.answer}</Tex></p><p><strong>Check or vary it: </strong><Tex>{example.transfer}</Tex></p></details></div>)}<h3>Make the method stick</h3><p>Close the solutions and rewrite both arguments from memory. In the topic practice below, begin with an untimed warm-up, then work through the medium problems. If you miss one, write down the first step you could not justify before checking the solution. Retry it on another day without your notes.</p></section>;
}
