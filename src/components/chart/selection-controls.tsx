import { urls as allUrls } from "./chart-utils/urls.js";
import { urlQualityOptions, datesOptions } from "./chart-utils/constants.js";

function Error({ text, show }) {
  return (
    <div
      className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
      role="alert"
      style={{ visibility: show ? "visible" : "hidden" }}>
      <strong className="font-bold">Error: {text}</strong>
    </div>
  );
}
function DatesSelection({ state, dispatch }) {
  const onDateTypeSelect = (selected: string) => {
    dispatch({ type: "setDates", payload: selected });
  };

  return (
    <div className="flex flex-row space-x-2">
      {datesOptions.map((option) => (
        <label key={option.value} className="inline-flex items-center">
          <input
            type="radio"
            name="datesOptions"
            value={option.value}
            checked={state.dateType === option.value}
            onChange={() => onDateTypeSelect(option.value)}
            className="form-radio text-indigo-600"
          />
          <span className="ml-2">{option.label}</span>
        </label>
      ))}
    </div>
  );
}

function UrlsSelection({ state, dispatch }) {
  const onUrlTypeSelect = (value: string) => {
    dispatch({ type: "setUrlType", payload: value });
  };

  const onUrlSelectionChange = (e) => {
    const selectedOptions = Array.from(
      e.target.selectedOptions,
      (option: any) => option.value
    );
    dispatch({ type: "setUrls", payload: selectedOptions });
  };
  const showError = state.urlType === "select-url" && state.urls?.length === 0;

  return (
    <div className="bg-slate-100 p-5 w-full">
      <div className="w-full flex flex-col space-x-2">
        <Error
          text="Please select urls from the selection box"
          show={showError}
        />
        <div className="flex w-full flex-row space-x-2 full-width">
          {urlQualityOptions.map((option) => (
            <label key={option.value} className="inline-flex items-center">
              <input
                type="radio"
                name="urlQuality"
                value={option.value}
                checked={state.urlType === option.value}
                onChange={() => onUrlTypeSelect(option.value)}
                className="form-radio text-indigo-600"
              />
              <span className="ml-2">{option.label}</span>
            </label>
          ))}
        </div>

        <div className="mt-4">
          <select
            multiple
            disabled={state.urlType !== "select-url"}
            className="w-full p-2 border border-gray-300 rounded"
            onChange={(e) => onUrlSelectionChange(e)}>
            {allUrls.map((url) => (
              <option key={url}>{url}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

export function ChartControls({ state, dispatch }) {
  return (
    <>
      <UrlsSelection state={state} dispatch={dispatch} />{" "}
      <DatesSelection state={state} dispatch={dispatch} />{" "}
    </>
  );
}
