export function Tabs({ selectedTab, setSelectedTab, options, tabs, children }) {
  const tabOptions = options ?? tabs ?? [];

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-1">
        {tabOptions.map(({ label, key }) => {
          return (
            <button
              key={key}
              className={
                selectedTab == key
                  ? "px-3 py-1.5 bg-blue-500 text-sm text-white"
                  : "px-3 py-1.5 bg-gray-100 text-sm text-black hover:bg-gray-200"
              }
              onClick={() => {
                setSelectedTab(key);
              }}>
              {label}
            </button>
          );
        })}
      </div>
      {children && (
        <div className="flex flex-wrap items-center gap-3">{children}</div>
      )}
    </div>
  );
}
