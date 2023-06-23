import {Row, Col} from 'react-bootstrap';

const CarItem = props => {
    return(
        <>
        <Row style={{marginBottom:10}} onClick={() => {props.onClick(props.car)}}>
            <Col xs={4}>
                <img alt="car" src={props.car.carImage} style={{width:'100%'}} />
            </Col>
            <Col xs={8}>
                <h5>{props.car.carModel}</h5>
                <p>{props.car.carPrice}</p>
            </Col>
        </Row>
        </>
    )
}

export default CarItem;