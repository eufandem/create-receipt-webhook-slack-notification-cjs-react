import React, { useState, useEffect } from 'react';
import { Form } from 'semantic-ui-react';
import Commerce from '@chec/commerce.js'

// Import Selections
import { monthOptions, yearOptions} from '../utils/cardOptions'
import { stateOptions } from '../utils/stateOptions'
import { canada } from '../utils/North America/canada'
import { mexico } from '../utils/North America/mexico'
import { countries } from '../utils/Countries'

const CheckoutForm = (props) => {
    // console.log(props, 'inside checkout form!!')

    const commerce = new Commerce(process.env.REACT_APP_PUBLICKEY_SANDBOX)

    const [sameBilling, setSameBilling] = useState(false)
    const [formInfo, setFormInfo] = useState({
        customer: {
            firstname: '',
            lastname: '',
            email: ''
        },
        shipping: {
            name: '',
            street: '',
            town_city: '',
            county_state: '',
            postal_zip_code: '',
            country: '',
        },
        payment: {
            gateway: 'test_gateway',
            card: {
                number: '',
                expiry_month: '',
                expiry_year: '',
                cvc: '',
                postal_zip_code: ''
            }
        }
    })

    useEffect(() => {
        let lineItems = {}

        props.liveObject.line_items.forEach(item => {

            lineItems = {
                ...lineItems,
                [item.id]: {
                    quantity: item.quantity,
                    variants: {
                        [item.variants[0].variant_id]: item.variants[0].option_id
                    }
                }
            }
        })

        setFormInfo({
            ...formInfo,
            line_items: lineItems,
            fulfillment: {
                shipping_method: props.shipOption
            }
        })
    }, [props.shipOption])

    useEffect(() => {

        if(sameBilling) {
            console.log('getting inside sameBilling!!!')
            setFormInfo({
                ...formInfo,
                billing: {
                    ...formInfo.shipping
                }
            })
        }
    }, [sameBilling])

    useEffect(() => {
        props.getShippingOptions(formInfo.shipping.country)
    }, [formInfo])

    const getCountryInfoShipping = () => {
        
        if (formInfo.shipping.country === 'MX') {
            return mexico
        }

        if (formInfo.shipping.country === 'CA') {
            return canada
        }

        if (formInfo.shipping.country === 'US') {
            return stateOptions
        }
    }
    
    const getCountryInfoBilling = () => {
        
        if (formInfo.billing && formInfo.billing.country === 'MX') {
            return mexico
        }

        if (formInfo.billing && formInfo.billing.country === 'CA') {
            return canada
        }

        if (formInfo.billing && formInfo.billing.country === 'US') {
            return stateOptions
        }
    }
    
    const handleChanges = (e, { name, value, id }) => {
        
        if (id === 'customer') {
            
            setFormInfo({
                ...formInfo, 
                customer: {
                    ...formInfo.customer,
                    [name]: value
                },
                shipping: {
                    ...formInfo.shipping,
                    name: formInfo.customer.firstname + ' ' + formInfo.customer.lastname
                }
            })
        }

        if (id === 'shipping') {
            setFormInfo({
                ...formInfo,
                shipping: {
                    ...formInfo.shipping,
                    [name]: value,
                    name: `${formInfo.customer.firstname} ${formInfo.customer.lastname}`
                },
            })
        }

        if (id === 'shipping' && sameBilling) {
            setFormInfo({
                ...formInfo,
                shipping: {
                    ...formInfo.shipping,
                    [name]: value,
                    name: `${formInfo.customer.firstname} ${formInfo.customer.lastname}`
                },
                billing: {
                    ...formInfo.shipping,
                    [name]: value,
                    name: `${formInfo.customer.firstname} ${formInfo.customer.lastname}`
                }
            })
        }

        if (id === 'payment') {
            setFormInfo({
                ...formInfo,
                payment: {
                    ...formInfo.payment,
                    card: {
                        ...formInfo.payment.card, 
                        [name]: value
                    }
                }
            })
        }

        if (id === 'billing' && !sameBilling) {
            setFormInfo({
                ...formInfo,
                billing: {
                    ...formInfo.billing,
                    [name]: value,
                }
            })
        }
    }

    const handleSubmit = e => {
        e.preventDefault()
        console.log(formInfo, 'info that is being submitted to capture!')

        if (props.shipOption) {
            console.log('ready to process')
        }
        
        // commerce.checkout.capture(props.tokenId, formInfo)
        //     .then(res => {
        //         console.log(res, 'res from CAPTURING CHECKOUT!!!')
        //     })
        //     .catch(err => {
        //         console.log(err)
        //     })

    }

    const handleCheckBox = e => {  
        setSameBilling(!sameBilling)
    }

    return (
        <Form className='checkout-form' onSubmit={handleSubmit}>
            <h1>Customer Info</h1>
            <Form.Group widths='equal'>
                <Form.Input required fluid id='customer' name='firstname' label='First name' placeholder='John' onChange={handleChanges} />
                <Form.Input required fluid id='customer' name='lastname' label='Last name' placeholder='Smith' onChange={handleChanges} />
                <Form.Input required fluid id='customer' name='email' label='Email' placeholder='xyz@example.com' onChange={handleChanges} type='email' />
            </Form.Group>
            <Form.Group>
                <Form.Input required width={10} id='shipping' name='street' label='Address' placeholder='122 Example St' onChange={handleChanges}/>
                <Form.Select
                    required 
                    width={6} 
                    id='shipping' 
                    name='country' 
                    label='Select Country' 
                    placeholder='United States' 
                    onChange={handleChanges}
                    options={countries}
                />
            </Form.Group>
            <Form.Group>
                <Form.Input required width={6} id='shipping' name='town_city' label='Town/City' placeholder='Las Vegas' onChange={handleChanges}/>
                <Form.Select
                    required 
                    width={6} 
                    label='County/State/Province/Territory' 
                    placeholder='Search ...'
                    id='shipping'
                    name='county_state' 
                    search 
                    selection 
                    fluid
                    options={getCountryInfoShipping()}
                    onChange={handleChanges}
                />
                <Form.Input required width={4} id='shipping' name='postal_zip_code' label='Zip/Postal' placeholder='00000' maxLength="5" onChange={handleChanges}/>
            </Form.Group>
            <h1>Payment Info</h1>
            <Form.Group>
                <Form.Input required id='payment' name='number' label='Credit Card Number' placeholder='0000111100001111' onChange={handleChanges}/>
                <Form.Input required id='payment' name='postal_zip_code' label='Billing Zip' placeholder='Enter Billing Zip Code' onChange={handleChanges}/>
            </Form.Group>
            <Form.Group>
                <Form.Select required id='payment' width={3} name='expiry_month' fluid options={monthOptions} label='Month' placeholder='02' onChange={handleChanges}/>
                <Form.Select required id='payment' width={3} name='expiry_year' fluid options={yearOptions} label='Year' placeholder='23' onChange={handleChanges}/>
                <Form.Input required id='payment' width={3} name='cvc' fluid label='CVV' placeholder='123' type='password' maxLength="3" onChange={handleChanges}/>
            </Form.Group>
            <h1>Billing Address</h1>
            <Form.Checkbox label='Billing Address Same as Shipping ...' onChange={handleCheckBox} />
            {!sameBilling && (
                <>
                    <Form.Group widths='equal'>
                        <Form.Input required width={10} id='billing' name='name' label='Billing Name' placeholder='John Smith' onChange={handleChanges}/>
                        <Form.Select
                            required    
                            width={6} 
                            id='billing' 
                            name='country' 
                            label='Select Country' 
                            placeholder='United States' 
                            onChange={handleChanges}
                            options={countries}
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Input required width={5} id='billing' name='street' label='Address' placeholder='122 Example St' onChange={handleChanges}/>
                        <Form.Input required width={3} id='billing' name='town_city' label='City' placeholder='Las Vegas' onChange={handleChanges}/>
                        <Form.Select
                            required
                            width={6} 
                            label='County/State/Province/Territory' 
                            placeholder='Search State'
                            id='billing'
                            name='county_state' 
                            search 
                            selection 
                            fluid
                            options={getCountryInfoBilling()}
                            onChange={handleChanges}
                        />
                        <Form.Input required width={2} id='billing' name='postal_zip_code' label='Zip' placeholder='00000' maxLength="5" onChange={handleChanges}/>
                    </Form.Group>
                </>
            )}
            <Form.Button color='green' size='huge'>
                Complete Checkout and Pay
            </Form.Button>
        </Form>
    );
};

export default CheckoutForm;