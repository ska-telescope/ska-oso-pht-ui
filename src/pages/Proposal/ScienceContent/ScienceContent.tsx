import React, {useState} from 'react';
import UploadPdfButton from '../../../components/button/uploadPdf/UploadPdfButton';

import {STATUS_ERROR, STATUS_OK, STATUS_PARTIAL } from '../../../utils/constants';

interface ScienceContentProps {
  page: number;
}

export default function ScienceContent({ page}: ScienceContentProps) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<
      "initial" | "uploading" | "success" | "fail"
  >("initial");

  React.useEffect(() => {
    if (typeof setStatus !== 'function') {
      return;
    }
    const result = [STATUS_ERROR, STATUS_PARTIAL, STATUS_OK];
    const count = 0;

    // TODO : Increment the count for every passing element of the page.
    // This is then used to take the status from the result array
    // In the default provided, the count must be 2 for the page to pass.

    // See titleContent page for working example

    setStatus([page, result[count]]);
  }, [setStatus]);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setStatus("initial");
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (file) {
      setStatus("uploading");

      const formData = new FormData();
      formData.append("file", file);

      try {
        const result = await fetch("https://httpbin.org/post", {
          method: "POST",
          body: formData,
        });

        const data = await result.json();

        console.log(data);
        setStatus("success");
      } catch (error) {
        console.error(error);
        setStatus("fail");
      }
    }
  };

  const Result = ({ status }: { status: string }) => {
    if (status === "success") {
      return <p> File uploaded successfully!</p>;
    } else if (status === "fail") {
      return <p>File upload failed!</p>;
    } else if (status === "uploading") {
      return <p>Uploading selected file...</p>;
    } else {
      return null;
    }
  };

  return (
      <>
        <div className="input-group">
          <input id="file" type="file" onChange={handleFileChange} />
          <UploadPdfButton/>
        </div>
        {file && (
            <button onClick={handleUpload} className="submit">
              Upload a file
            </button>
        )}
        <Result status={status} />
      </>
  );
}
