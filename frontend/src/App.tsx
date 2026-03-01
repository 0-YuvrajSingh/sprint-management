import { useEffect, useState } from "react";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/v1/projects")
      .then(res => res.text())
      .then(data => setMessage(data))
      .catch(err => console.error('Failed to fetch projects:', err));
  }, []);

  return <h1>{message}</h1>;
}

export default App;
