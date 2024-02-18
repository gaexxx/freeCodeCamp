import { useState } from "react";
import "./App.css";
import reactMarkdown from "react-markdown";
import Markdown from "react-markdown";
import $ from "jquery";

const markdown = "# Hi, *Pluto*!";
// <Markdown>{markdown}</Markdown>

// # Hi! This is a h1 title\n## and this is a h2\nHow about this **awesome** link of [Wikipedia](https://wikipedia.org/).\nThis is how the beautiful stories start: `!DOCTYPEhtml`\nHere is a code block:\n```\n<h1>Ciao Mario</h1>\n```\nWhat did you eat today?\n- [ ] Pasta\n- [ ] Lasagna\n- [x] Pizza\nAs a famous poet once said:\n>*Pizza is good*\nA photo of me: ![My photo](image_url)
const defaultMarkdown = `
# Hi! This is a h1 title
## and this is a h2 
How about this **awesome** link of [Wikipedia](https://wikipedia.org/).
\rThis is how the beautiful stories start: \`!DOCTYPEhtml\`
\rHere is a code block:\n\`\`\`\n<h1>Ciao Mario</h1>\n\`\`\`
\nWhat did you eat today?
\n- [ ] Pasta\n- [ ] Lasagna\n- [x] Pizza
\nAs a famous poet once said:\n >*Pizza is good*
\nA photo of me: ![My photo](image_url)
`;

function App() {
  const [text, setText] = useState(defaultMarkdown);

  ////////////// resize
  var isResizing = false,
    lastDownX = 0;

  $(function () {
    var container = $("#container"),
      left = $("#left_panel"),
      right = $("#right_panel"),
      handle = $("#drag");

    handle.on("mousedown", function (e) {
      isResizing = true;
      lastDownX = e.clientX;
    });

    $(document)
      .on("mousemove", function (e) {
        // we don't want to do anything if we aren't resizing.
        if (!isResizing) return;

        var offsetRight =
          container.width() - (e.clientX - container.offset().left);

        left.css("right", offsetRight);
        right.css("width", offsetRight);
      })
      .on("mouseup", function (e) {
        // stop resizing
        isResizing = false;
      });
  });
  ///////////////////
  console.log(text);

  return (
    <div id="radice">
      <div id="header">
        <h1>Markdown Preview</h1>
      </div>
      <div id="container">
        <div id="left_panel">
          <div className="title-box">
            <h2 className="title-editor">Editor</h2>
          </div>
          <textarea
            id="editor"
            value={text}
            onChange={(e) => setText(e.target.value)}
          ></textarea>
        </div>
        <div id="right_panel">
          <div id="drag"></div>
          <div className="title-box">
            <h2 className="title-preview">Preview</h2>
            <div id="preview">
              <Markdown>{text}</Markdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
