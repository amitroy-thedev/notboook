import { ArrowDownTrayIcon, KeyIcon, XMarkIcon } from '@heroicons/react/24/outline';
import React, { useRef } from 'react';
import { QRCode } from "react-qrcode-logo";
import domtoimage from "dom-to-image";
import { saveAs } from "file-saver";

export default function ShareQR({ generatedQR, setGeneratedQR }) {
  const downloadRef = useRef(null);

  const download = async () => {
    if (downloadRef.current) {
      const node = downloadRef.current;

      try {
        const blob = await domtoimage.toBlob(node, {
          height: node.offsetHeight,
          width: node.offsetWidth,
        });

        // Use the 'file-saver' library to initiate the download
        saveAs(blob, `${generatedQR}.png`);
      } catch (error) {
        alert("Failed while downloading the QR code, Try again !", error);
      }
    }
  };

  return (
    <div>
      {generatedQR && (
        <div className="back" style={{zIndex: "999"}}>
          <div className="card qr">
            <button type="button" onClick={() => setGeneratedQR("")} className="card-closebtn">
              <XMarkIcon className="icon" />
            </button>
            <div className="qrcode" ref={downloadRef}>
              <QRCode value={generatedQR}/>
              <h2 className='w100'><KeyIcon className='icon'/>{generatedQR}</h2>
            </div>
            <button type='button' className="download-btn primary" onClick={download}>DOWNLOAD QR <ArrowDownTrayIcon className='icon'/></button>
          </div>
        </div>
      )}
    </div>
  );
}
