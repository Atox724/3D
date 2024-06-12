import { transform_MS } from "@/utils";
import {
  readFileFirstRowByFile,
  readFileFirstRowByText,
  readFileLastRowByFile,
  readFileLastRowByText
} from "@/utils/file";

export const getDuration = async (
  firstFile: File | string,
  lastFile: File | string
) => {
  let startRow = "",
    endRow = "";
  if (typeof firstFile === "string") {
    startRow = readFileFirstRowByText(firstFile);
  } else {
    startRow = await readFileFirstRowByFile(firstFile);
  }
  if (typeof lastFile === "string") {
    endRow = readFileLastRowByText(lastFile);
  } else {
    endRow = await readFileLastRowByFile(lastFile);
  }

  const startColonIndex = startRow.indexOf(":");
  const endColonIndex = endRow.indexOf(":");
  if (startColonIndex === -1 || endColonIndex === -1) return;

  const startTime = transform_MS(+startRow.slice(0, startColonIndex));
  const endTime = transform_MS(+endRow.slice(0, endColonIndex));

  return { startTime, endTime };
};
