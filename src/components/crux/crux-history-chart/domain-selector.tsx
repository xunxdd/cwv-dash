export function DomainSelector({ domains, domainSelected, setDomainSelected }) {
  const onDomainSelectionChange = (e) => {
    setDomainSelected(e.target.value);
  };
  return (
    <div className="flex items-center bg-slate-100">
      <div className="bg-slate-100 px-5">Domain</div>
      <select
        value={domainSelected}
        className="w-full p-2 border border-gray-300 rounded"
        onChange={(e) => onDomainSelectionChange(e)}>
        <option value="all">All</option>
        {domains.map((url) => (
          <option key={url}>{url}</option>
        ))}
      </select>
    </div>
  );
}
