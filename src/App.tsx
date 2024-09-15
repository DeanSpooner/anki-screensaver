import { useEffect, useState } from "react";
import Papa from "papaparse";
import "./App.css";

const csvFilePath = "/jlptn4vocab.csv"; // Direct relative path

function App() {
  const [randomLine, setRandomLine] = useState<string[] | null>(null);
  const [data, setData] = useState<string[][]>([]); // Store the CSV data
  const [totalTime, setTotalTime] = useState<number>(0); // Total time for the current line
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [pause, setPause] = useState<boolean>(false);
  const [currentPartTime, setCurrentPartTime] = useState<number>(0); // Time for current part

  useEffect(() => {
    // Fetch the CSV file when the component mounts
    fetch(csvFilePath)
      .then(response => response.text())
      .then(csvText => {
        Papa.parse<string[]>(csvText, {
          complete: result => {
            const parsedData = (result.data as string[][]).filter(
              (line: string[]) => line.length > 0
            ); // Filter empty lines
            setData(parsedData);
            if (parsedData.length > 0) {
              // Pick a random line initially
              const randomIndex = Math.floor(Math.random() * parsedData.length);
              setRandomLine(parsedData[randomIndex]);
            }
          },
          error: (error: unknown) => {
            console.error("Error parsing CSV file:", error);
          },
        });
      })
      .catch(error => {
        console.error("Error fetching the CSV file:", error);
      });
  }, []);

  useEffect(() => {
    if (randomLine !== null) {
      const filteredLine = randomLine.filter(column => column !== "");
      setTotalTime(filteredLine.length * 3000);

      if (!pause) {
        const interval = setInterval(() => {
          setCurrentPartTime(prevTime => {
            if (prevTime >= 3000) {
              // Move to the next part
              if (currentIndex + 1 < filteredLine.length) {
                setCurrentIndex(prevIndex => prevIndex + 1);
                return 0; // Reset currentPartTime for the next part
              } else {
                // If at the end of the line, pick a new random line
                const randomIndex = Math.floor(Math.random() * data.length);
                setRandomLine(data[randomIndex]);
                setCurrentIndex(0); // Reset the index
                return 0; // Reset currentPartTime
              }
            }
            return prevTime + 100; // Increment by 100ms
          });
        }, 100); // Update every 100ms

        return () => clearInterval(interval); // Cleanup interval on unmount
      }
    }
  }, [randomLine, pause, currentIndex, data]);

  useEffect(() => {
    if (randomLine !== null && !pause) {
      const filteredLine = randomLine.filter(column => column !== "");
      setTotalTime(filteredLine.length * 3000);
    }
  }, [pause, randomLine]);

  return (
    <div className="App" onClick={() => setPause(!pause)}>
      {randomLine ? (
        <div className="output">
          <h1>
            JLPT N4 Vocab - press anywhere on the screen to{" "}
            {pause ? "unpause" : "pause"}:
          </h1>
          <progress
            id="file"
            value={((currentIndex * 3000 + currentPartTime) / totalTime) * 100}
            max="100"
            style={{ width: "90vw", height: 50 }}
          ></progress>
          {randomLine
            .filter(column => column !== "")
            .map((column, index) => (
              <h2 key={index}>{index <= currentIndex ? column : "..."}</h2>
            ))}
        </div>
      ) : (
        <p>Loading vocabulary...</p>
      )}
    </div>
  );
}

export default App;
