import React from "React";

export default function AssetDetails({ name, number, description, children }) {
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
            {children
              .filter(child => child.assetType === "Test")
              .map(child => <li key={child._oid}>{child.name}</li>)}
          </ol>
        </section>
        <section>
          <h2>Tasks</h2>
          <ol>
            {children
              .filter(child => child.assetType === "Task")
              .map(child => <li key={child._oid}>{child.name}</li>)}
          </ol>
        </section>
      </header>
    </div>
  );
}
