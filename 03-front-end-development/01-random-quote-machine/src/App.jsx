import { useState, useEffect } from "react";
import "./App.css";

const api = "https://api.quotable.io/random";

function App() {
  const [citazione, setCitazione] = useState("Chi la fa l'aspetti");
  const [autore, setAutore] = useState("Salvatore Terrazzo");
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [toggle, setToggle] = useState(false);

  const changeQuote = () => {
    if (citazione === "Un'altra bella citazione") {
      setCitazione("Chi la fa l'aspetti");
    } else {
      setCitazione("Un'altra bella citazione");
    }
    setAutore("Paolo Cohello");
  };

  useEffect(() => {
    const randomNum = Math.floor(Math.random() * 16777215).toString(16);
    const color = "#" + randomNum;
    console.log(color);
    const sfondi = document.querySelectorAll(".background-color");
    sfondi.forEach((element) => {
      element.style.backgroundColor = color;
    });
    const testi = document.querySelectorAll(".color");
    testi.forEach((element) => {
      element.style.color = color;
    });
  }, [citazione]);

  useEffect(() => {
    const getData = async () => {
      try {
        const risultato = await fetch(api);
        console.log(risultato);
        if (!risultato.ok) {
          setIsError(true);
          setIsLoading(false);
          return;
        }
        const data = await risultato.json();
        console.log(data);
        setCitazione(data.content);
        setAutore(data.author);
      } catch (error) {
        setIsError(true);
        console.log(error);
      }
      setIsLoading(false);
    };
    getData();
  }, [toggle]);

  if (isLoading) {
    return (
      <div id="container" className="background-color">
        <div id="quote-box">
          <h2 id="text" className="color">
            ""
          </h2>
          <hr />
          <h4 id="author" className="color">
            ""
          </h4>
          <div id="button-container">
            <a id="tweet-quote" href="twitter.com/intent/tweet" target="_blank">
              <button id="share" className="background-color">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
                  />
                </svg>
              </button>
            </a>
            <button
              id="new-quote"
              className="background-color"
              onClick={() => setToggle(!toggle)}
            >
              <span>New quote</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return <h1>Error</h1>;
  }

  return (
    <div id="container" className="background-color">
      <div id="quote-box">
        <h2 id="text" className="color">
          "{citazione}"
        </h2>
        <hr />
        <h4 id="author" className="color">
          {autore}
        </h4>
        <div id="button-container">
          <a id="tweet-quote" href="twitter.com/intent/tweet" target="_blank">
            <button id="share" className="background-color">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
                />
              </svg>
            </button>
          </a>
          <button
            id="new-quote"
            className="background-color"
            onClick={() => setToggle(!toggle)}
          >
            <span>New quote</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
