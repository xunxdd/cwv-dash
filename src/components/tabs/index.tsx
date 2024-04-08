import { useEffect, useState } from "react";

export function Tabs({ selectedTab, setSelectedTab, options }) {
  const [tabOptions, setTabOptions] = useState(options);

  useEffect(() => {
    const env = window?.environment;

    if (env === "production") {
      setSelectedTab("sample-origins");
      setTabOptions([]);
    }
  }, []);

  return (
    <>
      <div>
        {tabOptions.map(({ label, key }) => {
          return (
            <button
              key={key}
              className={
                selectedTab == key
                  ? "px-4 py-2 bg-blue-500 text-white"
                  : "px-4 py-2 bg-gray-100 text-black"
              }
              onClick={() => {
                setSelectedTab(key);
              }}>
              {label}
            </button>
          );
        })}
      </div>
      <div>
        <slot />
      </div>
    </>
  );
}
