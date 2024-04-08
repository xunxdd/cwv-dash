export function Tabs({ selectedTab, setSelectedTab, options }) {
  return (
    <>
      <div>
        {options.map(({ label, key }) => {
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
