import React from "React";

export default function AssetDetails({
  name,
  number,
  description,
  tasks,
  tests
}) {
  return (
    <div>
      <header>
        <h1>
          {name} <small>{number}</small>
        </h1>
        <div dangerouslySetInnerHTML={{ __html: description }} />
        <section>
          <h2>Tests</h2>
          <ol>
            {tests.map(child => (
              <li key={child._oid}>
                <input type="checkbox" checked={child.isReady} /> {child.name}
              </li>
            ))}
          </ol>
        </section>
        <section>
          <h2>Tasks</h2>
          <ol>
            {tasks.map(child => (
              <li key={child._oid}>
                <input type="checkbox" checked={child.isReady} /> {child.name}
              </li>
            ))}
          </ol>
        </section>
      </header>
    </div>
  );
}
