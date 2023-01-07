import React, { useState } from "react";

function App() {
  const [word, setWord] = useState("");
  const [data, setData] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchData(word);
  };

  const htmlparser2 = require("htmlparser2");

  async function fetchData(word) {
    const url = `https://tureng.com/en/turkish-english/${word}`;
    const response = await fetch(url);
    const html = await response.text();

    const rows = [];
    let inTable = false;
    let inRow = false;
    let currentRow = [];

    const parser = new htmlparser2.Parser(
      {
        onopentag: (name, attribs) => {
          if (name === "table") {
            inTable = true;
          } else if (name === "tr" && inTable) {
            inRow = true;
          } else if (name === "td" && inRow) {
            currentRow.push("");
          }
        },
        ontext: (text) => {
          if (inRow) {
            currentRow[currentRow.length - 1] += text;
          }
        },
        onclosetag: (name) => {
          if (name === "table") {
            inTable = false;
          } else if (name === "tr") {
            inRow = false;
            if (currentRow.length > 1) {
              rows.push({
                id: currentRow[0],
                category: currentRow[1],
                translation: currentRow[3],
              });
            }
            currentRow = [];
          }
        },
      },
      { decodeEntities: true }
    );

    parser.write(html);
    parser.end();

    setData(rows);
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>
          Word:
          <input
            type="text"
            value={word}
            onChange={(e) => setWord(e.target.value)}
          />
        </label>
        <input type="submit" value="Submit" />
      </form>
      <table className="table">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Category</th>
            <th scope="col">Translate</th>
          </tr>
        </thead>
        {data.map((entry) => (
          <tbody>
            <tr key={entry.id}>
              <th scope="row">{entry.id}</th>
              <td>{entry.category}</td>
              <td>{entry.translation}</td>
            </tr>
          </tbody>
        ))}
      </table>
    </div>
  );
}

export default App;
