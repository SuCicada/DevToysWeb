import { NextPage } from "next";
import { useState } from "react";

import { Select, SplitEditor } from "../../components/io";
import { Configuration, SectionConfiguration, SectionMain } from "../../components/section";
import { VSpacerM } from "../../components/Spacer";
import { IconConversion, IconIndentation } from "../../data/icon";
import { useLocale } from "../../hooks/useLocale";
import MainLayout from "../../layouts/MainLayout";
function split(input: string, separator: string, limit?: number) {
  let res = input.split(separator);
  if (limit) {
    res = res.slice(0, limit - 1).concat(res.slice(limit - 1).join(separator));
  }
  return res;
}
const FormToJson = (input: string): string => {
  if (!input) return "";
  const lines = input.trim().split("\n");
  const result: Record<string, any> = {};
  lines.forEach((line) => {
    console.log("line", line);
    let [key, value] = split(line, ":", 2);
    if (!value) return;
    value = value?.trim();
    if (value.startsWith("[") && value.endsWith("]")) {
      console.log("value", value);
      value = eval(value);
    }
    result[key.trim()] = value;
  });
  const res = JSON.stringify(result, null, 2);
  console.log("input", input);
  console.log("res", res);
  return res;
};
const JsonToForm = (input: string): string => {
  if (!input) return "";
  try {
    const obj = JSON.parse(input);
    return Object.entries(obj)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");
  } catch (err) {
    console.error(err);
    return "";
  }
};
const conversionOptions = [
  {
    name: "FORM to JSON",
    value: "form-to-json",
  },
  {
    name: "JSON to FORM",
    value: "json-to-form",
  },
];

export default function PostFormJson() {
  const { t } = useLocale();

  const [input, setInput] = useState("");
  const [conversion, setConversion] = useState(conversionOptions[0]);
  // const [indent, setIndent] = useState(FORM_TO_JSON);

  const output = conversion.value === conversionOptions[0].value ? FormToJson(input) : JsonToForm(input);
  const inputLanguage = conversion.value === conversionOptions[0].value ? "text" : "json";
  const outputLanguage = conversion.value === conversionOptions[0].value ? "json" : "text";

  return (
    <MainLayout title={t.jsonYaml.title}>
      <SectionConfiguration title={t.common.configTitle}>
        <Configuration icon={IconConversion} title={t.jsonYaml.conversionTitle} desc={t.jsonYaml.conversionSubtitle}>
          <div className="w-40">
            <Select options={conversionOptions} value={conversion} onChange={setConversion} />
          </div>
        </Configuration>
        {/*<Configuration icon={IconIndentation} title={t.jsonYaml.indentTitle}>*/}
        {/*  <div className="w-32">*/}
        {/*    <Select*/}
        {/*      options={t.jsonYaml.indentOptions}*/}
        {/*      value={indent}*/}
        {/*      onChange={setIndent}*/}
        {/*    />*/}
        {/*  </div>*/}
        {/*</Configuration>*/}
      </SectionConfiguration>

      <VSpacerM />
      <SectionMain className="grow">
        <SplitEditor
          input={input}
          setInput={setInput}
          output={output}
          inputLanguage={inputLanguage}
          outputLanguage={outputLanguage}
        />
      </SectionMain>
    </MainLayout>
  );
}
