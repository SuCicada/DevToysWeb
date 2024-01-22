import axios from "axios";
import { useEffect, useState } from "react";
import { VscPlay } from "react-icons/vsc";
import styled from "styled-components";

import { Button, ClearButton, CopyButton, PasteButton } from "../../components/button";
import { FileInputButton, Select, TextArea, Toggle } from "../../components/io";
import { SectionHeader, SectionMain } from "../../components/section";
import Spacer, { VSpacerL, VSpacerM } from "../../components/Spacer";
import { IconConversion, IconPlay } from "../../data/icon";
import { useLocale } from "../../hooks/useLocale";
import MainLayout from "../../layouts/MainLayout";

const RubyStyle = styled.div`
  //color: red;
  padding-top: 10px;
  font-size: 32px;
  line-height: 66px;

  & rt {
    color: #92ff94;
    font-size: 18px;
    //padding-bottom: 5px;
    transform: translateY(-0.5em);
    //font-size: 32px;
    position: relative;
    top: -0.5em;
    user-select: none;
  }
`;

const FuriganaStyle = styled.div`
  font-size: 25px;
  white-space: pre-wrap;
`;

const JapaneseHtml = (arrayLike: ArrayLike<number>) => {
  const { t } = useLocale();

  const [input, setInput] = useState("");
  // const [encode, setEncode] = useState(true);
  const [output, setOutput] = useState("");
  let [rubyHtml, setRubyHtml] = useState<JSX.Element>();
  let [furigana, setFurigana] = useState("");
  let [kanjiFurigana, setKanjiFurigana] = useState("");

  let [audioUrl, setAudioUrl] = useState("");
  let [audioAutoPlay, setAudioAutoPlay] = useState(false);
  useEffect(() => {
    japanese(input);
  }, [input]);

  async function japanese(str: string) {
    str = str.trim();
    if (str.length === 0) {
      // setOutput("");
      return;
    }

    const options = {
      method: "POST",
      url: process.env.NEXT_PUBLIC_JAPANESE_FURIGANA_API,
      // url: 'http://localhost:41401/convert',
      headers: { "content-type": "application/json" },
      data: { text: str },
    };

    try {
      const { data } = await axios.request(options);
      console.log(data);
      let rubyHtmlArr: JSX.Element[] = [];
      let furiStr = "";
      let kanjiFuStr = "";
      data["data"].forEach((item: any) => {
        const [character, type, hiragana, katakana] = item;
        let ruby: JSX.Element;
        switch (type) {
          case 1:
            ruby = (
              <>
                <ruby>
                  {character}
                  <rp>(</rp>
                  <rt>{hiragana}</rt>
                  <rp>)</rp>
                </ruby>
              </>
            );

            furiStr += hiragana;
            kanjiFuStr += `${character}(${hiragana})`;
            break;

          case 2:
          default:
            switch (character) {
              case " ":
                ruby = <>&nbsp;</>;
                break;
              case "\n":
                ruby = <br />;
                break;
              default:
                ruby = <>{character}</>;
            }
            furiStr += character;
            kanjiFuStr += character;
        }
        rubyHtmlArr.push(ruby);
      });

      let rubyHtml1 = <span className={"morpheme"}>{rubyHtmlArr.map((item) => item)}</span>;
      setRubyHtml(rubyHtml1);

      setFurigana(furiStr);
      setKanjiFurigana(kanjiFuStr);
      setAudioUrl("");

      // setOutput(data);
    } catch (error) {
      console.error(error);
    }
  }

  async function getAudio(str: string = furigana) {
    str = str.trim();
    if (str.length === 0) {
      // setOutput("");
      return;
    }

    const options = {
      method: "POST",
      url: process.env.NEXT_PUBLIC_TTS_HUB_API,
      headers: { "content-type": "application/json" },
      data: {
        tts_engine: "gtts",
        text: str,
        language: "ja",
        speed: 1,
        // "voice": "alloy"
      },
    };

    try {
      const { data } = await axios.request(options);
      let sampling_rate = data["sampling_rate"];
      let audioBase64 = data["audio"];
      // let audioBase64 = audioBase64Str.split(',')[1]
      let arrayBuffer = Buffer.from(audioBase64, "base64");

      const blob = new Blob([arrayBuffer], { type: "audio/wav" });
      const audioUrl = URL.createObjectURL(blob);

      setAudioUrl(audioUrl);
    } catch (error) {
      console.error(error);
    }
  }

  // const output = escape(input);
  // const output = encode ? escape(input) : unescape(input);
  // const [option, setTheme] = useState(t.markdownPreview.themeOptions[0]);

  return (
    <MainLayout title={"日本語振り仮名"} cardLayout={true}>
      {/*<SectionConfiguration title={t.common.configTitle}>*/}
      {/*  <Configuration*/}
      {/*    icon={IconConversion}*/}
      {/*    title={t.html.conversionTitle}*/}
      {/*    desc={t.html.conversionSubtitle}*/}
      {/*  >*/}
      {/*    /!*<Toggle*!/*/}
      {/*    /!*  on={encode}*!/*/}
      {/*    /!*  onChange={setEncode}*!/*/}
      {/*    /!*  desc={t.html.encodeDesc}*!/*/}
      {/*    /!*  onText={t.html.encodeText}*!/*/}
      {/*    /!*  offText={t.html.decodeText}*!/*/}
      {/*  </Configuration>*/}
      {/*</SectionConfiguration>*/}

      {/*<VSpacerL />*/}
      <SectionMain className="flex grow flex-col">
        <SectionHeader title={t.common.inputTitle} label="input">
          <PasteButton onClick={setInput} />
          <Spacer x={6} />
          <FileInputButton onFileRead={setInput} accept="" />
          <Spacer x={6} />
          <ClearButton onClick={() => setInput("")} />
        </SectionHeader>
        <TextArea id="input" value={input} onChange={setInput} />
      </SectionMain>

      {/*<VSpacerM />*/}
      <SectionMain className="flex grow flex-col">
        <SectionHeader title={t.common.outputTitle} label="output">
          <Button
            icon={IconPlay}
            text={"Play"}
            onClick={() => {
              getAudio(furigana);
            }}
          />
          <CopyButton text={input} />
        </SectionHeader>

        {/*<span onClick={() => getAudio(furigana)}>*/}
        <RubyStyle>
          <div>{rubyHtml}</div>
        </RubyStyle>
        <div
          style={{
            display: "flex",
            alignContent: "center",
          }}
        >
          <Button icon={IconPlay} text={"Play"} onClick={() => getAudio(furigana)} />
          <audio
            controls
            src={audioUrl}
            autoPlay={true}
            style={{
              // display: audioUrl ? "block" : "none"
              width: "100%",
            }}
          ></audio>
        </div>
        {/*</span>*/}

        <SectionHeader title="送仮名" label="output">
          <CopyButton text={kanjiFurigana} />
        </SectionHeader>
        <FuriganaStyle>
          <p>{kanjiFurigana}</p>
        </FuriganaStyle>

        <SectionHeader title="振り仮名" label="output">
          <CopyButton text={furigana} />
        </SectionHeader>
        <FuriganaStyle>
          <p>{furigana}</p>
        </FuriganaStyle>
      </SectionMain>
    </MainLayout>
  );
};
export default JapaneseHtml;

function arrayBufferToBase64(arrayBuffer: ArrayBuffer) {
  const uint8Array = new Uint8Array(arrayBuffer);
  let binaryString = "";
  uint8Array.forEach((byte) => {
    binaryString += String.fromCharCode(byte);
  });
  return btoa(binaryString);
}
