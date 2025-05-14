import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const OneboxPage = () => {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState("");
  const [emailData, setEmailData] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch token from URL
    const jwtToken = searchParams.get("token");
    console.log("Token from URL: ", jwtToken); // Log the token for debugging
    setToken(jwtToken);

    if (jwtToken) {
      // Make API call to fetch emails
      fetch("https://hiring.reachinbox.xyz/api/v1/onebox/list", {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      })
        .then((res) => {
          console.log("API Response Status: ", res.status); // Log the response status
          return res.json();
        })
        .then((data) => {
          console.log("API Data: ", data); // Log the response data for debugging

          if (data.status === 200) {
            setEmailData(data.data);
          } else {
            setError("Failed to load emails.");
          }
        })
        .catch((err) => {
          console.error("Failed to fetch email threads", err);
          setError("Error fetching email data.");
        });
    } else {
      setError("No token found in URL.");
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-center mb-6">🎉 Logged in Successfully</h1>
      <p className="text-center text-gray-700 mb-4">Welcome to Smartbox</p>

      <div className="text-sm text-center text-gray-500 mb-10">
        <strong>Token:</strong> {token ? `${token.slice(0, 20)}...` : "Not found"}
      </div>

      {/* Show Error if any */}
      {error && <div className="text-center text-red-500 mb-4">{error}</div>}

      {/* Display the Emails */}
      {emailData.length > 0 ? (
        <div className="space-y-4 max-w-xl mx-auto">
          {emailData.map((email) => (
            <div
              key={email.id}
              className="p-4 bg-white rounded-lg shadow border hover:bg-gray-100"
            >
              <div className="font-semibold">{email.subject}</div>
              <div className="text-sm text-gray-600">{email.fromEmail}</div>
              <div
                className="mt-2 text-gray-700"
                dangerouslySetInnerHTML={{ __html: email.body }}
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No emails found or still loading...</p>
      )}
    </div>
  );
};

export default OneboxPage;
