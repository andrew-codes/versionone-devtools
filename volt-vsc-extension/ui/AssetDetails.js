import React from "React";
import { noop } from "underscore";
import { actionCreators } from "../state/domains/v1/actions";

export default function AssetDetails({
  dispatch,
  name,
  number,
  description,
  tasks,
  tests,
  testReadyStatus,
  testDevelopingStatus
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
            {tests.map(test => (
              <li key={test._oid}>
                <input
                  type="checkbox"
                  checked={test.isReady}
                  onChange={() => {
                    if (test.isReady) {
                      dispatch(
                        actionCreators.setTestStatus({
                          test,
                          status: testDevelopingStatus
                        })
                      );
                    } else {
                      dispatch(
                        actionCreators.setTestStatus({
                          test,
                          status: testReadyStatus
                        })
                      );
                    }
                  }}
                />{" "}
                {test.name}
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
AssetDetails.defaultProps = {
  onUpdate: noop
};
