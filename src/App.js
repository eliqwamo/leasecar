import React, {useState, useEffect} from 'react';
import './App.css';
import {
  Button,
  Container, Row, Col,
  FloatingLabel, ButtonGroup,
  ToggleButton, Spinner, Form
} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import CarItem from './CarItem';

//Firebase
import {database, storage} from './Firebase-Config';
import {collection,addDoc,getDocs} from 'firebase/firestore';
import {ref, getDownloadURL, uploadBytesResumable} from 'firebase/storage';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

//Let's start with the UI

function App() {

  const [carModel, setCarModel] = useState("");
  const [carPrice, setCarPrice] = useState("");
  const [carImage, setCarImage] = useState("");
  const [cars, setCars] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const [selectedCar, setSelectedCar] = useState(null);

  const months = [
    {name: '12', value: '12'},
    {name: '24', value: '24'},
    {name: '36', value: '36'},
    {name: '48', value: '48'},
    {name: '60', value: '60'},
  ]
  const [selectedMonths, setSelectedMonths] = useState('60');

  const [minValue, setMinValue] = useState(selectedCar ? (selectedCar.carPrice * 10) / 100 : 0);
  const [maxValue, setMaxValue] = useState(selectedCar ? selectedCar.carPrice : 0);
  const [selectedValue, setSelectedValue] = useState(0);

  const addNewCar = async() => {
    setIsUploading(true)
    if(carModel !== "" && carPrice !== "" && carImage !== ""){

      const storageRef = ref(storage, `files/${carImage.name}`);
      const uploadTask = uploadBytesResumable(storageRef, carImage);
      uploadTask.on("state_changed", (snapshot) => {
        const prog = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        setProgress(prog);
      }, (error) => console.log(error), () => {
        getDownloadURL(uploadTask.snapshot.ref)
        .then(async (downloadURL) => {

          await addDoc(collection(database, "cars"), {
            createdAt: Date.now(),
            carModel: carModel,
            carPrice: carPrice,
            carImage: downloadURL
          })
          .then(result => {
            toast.success('New car added')
            setIsUploading(false)
            loadCars()
            setCarModel("")
            setCarPrice("")
            setCarImage("")
          })
        })
        .catch(error => {
          toast.error(error.message)
        })
      })

    } else {
      setIsUploading(false)
      toast.error('All inputs are required!');
    }
  }

  const loadCars = async() => {
    try {
      const query = await getDocs(collection(database, "cars"));
      setCars(
        query.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id
        }))
      )
    } catch (error) {
      //TODO
    }
  }

  useEffect(() => {
    loadCars()
  },[])

  useEffect(() => {

    if(selectedCar){
      setMinValue((selectedCar.carPrice * 10) / 100);
      setSelectedValue((selectedCar.carPrice * 10) / 100);
      setMaxValue(selectedCar.carPrice)
    }

  },[selectedCar])

  return (
    <>
    <ToastContainer />
      <Container fluid>

        <Row>
          <Col xl={12} style={{paddingTop:20, paddingBottom:20}}>
            <h1>CAR<span style={{color:'#00cc99'}}>LEASE</span></h1>
          </Col>
        </Row>

        <Row>
          <Col xl={2}>
            <p>Add a new vehicle to check its monthly payment terms</p>
          </Col>
          <Col xl={3}>
            <FloatingLabel label="Car name and model">
              <Form.Control type="text" 
              value={carModel} onChange={(e) => {setCarModel(e.target.value)}}
              placeholder='Car name and model' />
            </FloatingLabel>
          </Col>
          <Col xl={2}>
            <FloatingLabel label="Car price">
              <Form.Control type="text" 
              value={carPrice} onChange={(e) => {setCarPrice(e.target.value)}}
              placeholder='Car price' />
            </FloatingLabel>
          </Col>
          <Col xl={3}>
            <FloatingLabel label="Upload image">
              <Form.Control type="file" 
              onChange={(e) => {setCarImage(e.target.files[0])}}
              placeholder='Upload image' />
            </FloatingLabel>
          </Col>
          <Col xl={2}>
            {
              isUploading ? (
                <>
                <Spinner animation="border" variant="warning" />
                <p>{progress}</p>
                </>
              ) : (
                <Button onClick={addNewCar} variant='info' size='lg'>ADD</Button>
              )
            }
          </Col>
        </Row>


        <Row style={{marginTop:20}}>
          <Col xl={3}>
            <h3>Our cars</h3>

            {
              cars.length > 0 && (
                <>
                  {
                    cars.map((car) => (
                      <CarItem onClick={() => {setSelectedCar(car)}} car={car} />
                    ))
                  }
                </>
              )
            }

          </Col>
          <Col xl={5}>
            <h3>Selected Car</h3>

            {
              selectedCar ? (<>
                <img alt="Car" src={selectedCar.carImage} style={{width:'100%'}} />
                <h3 style={{marginTop:20}}>{selectedCar.carModel}</h3>
                <h1 style={{marginTop:20}}>${selectedCar.carPrice}</h1>
              </>) : (<>
                <p>Please select your car</p>
              </>)
            }

          </Col>
          <Col xl={4}>
            <h3>Calculate Monthly Pay</h3>

            <h5>Number of months:</h5>
            <ButtonGroup>
              {
                months.map((radio, idx) => (
                  <ToggleButton
                    key={idx}
                    id={`radio-${idx}`}
                    type='radio'
                    variant='outline-light'
                    name='radio'
                    value={radio.value}
                    checked={selectedMonths === radio.value}
                    onChange={(e) => setSelectedMonths(e.currentTarget.value)}
                  >
                    {radio.name}
                  </ToggleButton>
                ))
              }
            </ButtonGroup>


            <h5 style={{marginTop:20}}>Pre-Payment</h5>
            <Form.Range
              value={selectedValue}
              min={minValue}
              max={maxValue}
              onChange={(e) => {setSelectedValue(e.target.value)}}
            />

            <h3>${selectedValue}</h3>

            <h1 style={{marginTop:20}}>
              ${((maxValue - selectedValue) / selectedMonths).toFixed()} /
              {selectedMonths} <span style={{fontSize:14}}>Months</span>
            </h1>

          </Col>
        </Row>

      </Container>
    </>
  );
}

export default App;
