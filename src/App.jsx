import Webcam from "react-webcam";
import './App.css'
import JSZip from "jszip";
import { useRef, useState, useEffect } from "react";
import { useSnackbar } from 'react-simple-snackbar'



import PropTypes from 'prop-types';

const CountDown = ({ seconds = 15, onCountDownEnd }) => {
  const [counter, setCounter] = useState(seconds);

  useEffect(() => {
    if (counter > 0) {
      setTimeout(() => setCounter(counter - 1), 1000);
    } else {
      onCountDownEnd();
    }
  }, [counter, onCountDownEnd]);

  return <h1>Siguiente toma en: {counter}</h1>;
};

CountDown.propTypes = {
  seconds: PropTypes.number,
  onCountDownEnd: PropTypes.func.isRequired,
};

function App() {
  let abecedario = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 
                    'i', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 
                    'r', 't', 'u', 'v', 'w', 'x', 'y'
                  ];
  let webcamRef = useRef(null);
  let spriteRef = useRef(null);
  const [openSnackbar] = useSnackbar()

  const delay = ms => new Promise(
    resolve => setTimeout(resolve, ms)
  );
  const [startCapture, setStartCapture] = useState(false);
  const [indexAbecedario, setIndexAbecedario] = useState(0);
  const [i, setI] = useState(0);
  let [j, setJ] = useState(0);

  let [arrayImagenes, setArrayImagenes] = useState([]);
  let [name, setName] = useState('');

  const capture = async () => {
    const imageObj = {
      letra: abecedario[indexAbecedario],
      imagenes: []
    }
    for (let index = 0; index < 10; index++) {
      const imageSrc = webcamRef.current.getScreenshot();
      imageObj.imagenes.push(imageSrc);
      await delay(1000);
      openSnackbar(`Imagen ${index + 1} de 10`);
    }
    setArrayImagenes([...arrayImagenes, imageObj]);
    setIndexAbecedario(indexAbecedario + 1);
    newSprite();
  }

  const limpiar = () => {
    setIndexAbecedario(0);
    setI(0);
    setJ(0);
    setArrayImagenes([]);
  }

  const newSprite = () => {
    let newJ = j === 6 ? 0 : j + 1;
    let tempI = i;
    if (j === 6) {
      const newI = i === 3 ? 0 : i + 1;
      tempI = newI;
    }
    if (tempI === 1 && newJ === 2) {
      newJ = 3;
    }
    if(tempI === 2 && newJ === 0) {
      newJ = 1;
    }
    if(tempI === 2 && newJ === 5) {
      newJ = 6;
    }
    if(tempI === 3 && newJ === 5) {
      newJ = 0;
      tempI = 0;
    }
    setI(tempI);
    setJ(newJ);
  }

  const descargar = () => {
    // download on zip
    let zip = new JSZip();
    arrayImagenes.forEach((imagen) => {
      let folder = zip.folder(imagen.letra);
      imagen.imagenes.forEach((img, index) => {
        folder.file(`${index + 1}.jpg`, img.split(',')[1], {base64: true});
      })
    })
    zip.generateAsync({type:"blob"})
      .then(function(content) {
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(content);
        link.download = `${name}.zip`;
        link.click();
    });
  }



  return (
    <>
      <div className="App">
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <h1>Letra: </h1>
          <div id="guia" ref={spriteRef} style={{
            backgroundPosition: `top -${335 + (145*i)}px left -${105 + (122.5*j)}px`,
          }}/>
        </div>
        {
          startCapture && (<CountDown onCountDownEnd={() => {
            capture();
            setStartCapture(false);
          }} />)
        }
        <Webcam audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg" 
          />
      </div>
      <div className="App"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
      <form action="" style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: '640px',
      }}
        onSubmit={(e) => {
          e.preventDefault();
          descargar();
          e.target.reset();
        }}
      >
        <input 
          style={{
            width: '100%',
            marginTop: '10px',
            height: '30px',
            fontSize: '20px',
          }} 
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required 
        />
        <div style={{marginTop: '20px'}}>
          <button onClick={() => {
            window.scrollTo(0, 0);
            setStartCapture(true);
          }} type="button" disabled={indexAbecedario >= abecedario.length}  style={{marginRight: '10px'}}>Iniciar letra: {abecedario[indexAbecedario].toUpperCase()}</button>
          <button type="submit" disabled={arrayImagenes.length === 0}>Descargar</button>
        </div>
      </form>
      </div>

      <div className="App">
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
        }}>
          <h1 style={{marginRight: '30px'}}>Letras {arrayImagenes.length}</h1>
          <button onClick={limpiar}>Limpiar</button>
        </div>
        <div>
          <p>
            Enviar el zip al correo: <a href="mailto:lucas.moreno.olivos@gmail.com">lucas.moreno.olivos@gmail.com</a> o al número de whatsapp: <a href="https://wa.me/+51920220170">920 220 170</a>
          </p>
          <p>
            Las fotos recolectadas serán utilizadas para el desarrollo de un proyecto de investigación. No seran utilizadas para ningún otro fin.
          </p>
        </div>
      </div>
    </>
  )
}

export default App
