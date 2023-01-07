import React, { useState } from "react";
import { parse as parseHtml } from "parse5";

function App() {
  const [word, setWord] = useState("");
  const [data, setData] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchData(word);
  };

  async function fetchData(word) {
    const url = `https://tureng.com/en/turkish-english/${word}`;
    const response = await fetch(url);
    const html = await response.text();

    const root = parseHtml(html);
    let table;
    function searchForTable(node) {
      if (node.nodeName === "table") {
        table = node;
        return;
      }
      if (node.childNodes) {
        node.childNodes.forEach((child) => searchForTable(child));
      }
    }

    searchForTable(root);

    let tbody;
    table.childNodes.forEach((node) => {
      if (node.nodeName === "tbody") {
        tbody = node;
      }
    });
    if (tbody) {
      const rows = [];

      function searchForTr(node) {
        if (node.nodeName === "tr") {
          rows.push(node);
          return;
        }
        if (node.childNodes) {
          node.childNodes.forEach((child) => searchForTr(child));
        }
      }

      searchForTr(tbody);

      rows.forEach((row) => {
        const cells = row.childNodes.filter((node) => node.nodeName === "td");
        if (cells.length > 1) {
          const wordNode = cells[2].childNodes.find(
            (node) => node.nodeName === "a"
          );
          const word = wordNode
            ? wordNode.childNodes[0].value
            : cells[2].childNodes[0].value;
          const translationNode = cells[3].childNodes.find(
            (node) => node.nodeName === "a"
          );
          const translation = translationNode
            ? translationNode.childNodes[0].value
            : cells[3].childNodes[0].value;
          const entry = {
            id: cells[0].childNodes[0].value,
            category: cells[1].childNodes[0].value,
            word,
            translation,
          };
          data.push(entry);
        }
      });

      setData(data);
    }
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
            <th scope="col">Word</th>
            <th scope="col">Translate</th>
          </tr>
        </thead>
        {data.map((entry) => (
          <tbody>
            <tr key={entry.id}>
              <th scope="row">{entry.id}</th>
              <td>{entry.category}</td>
              <td>{entry.word}</td>
              <td>{entry.translation}</td>
            </tr>
          </tbody>
        ))}
      </table>
    </div>
  );
}

export default App;
