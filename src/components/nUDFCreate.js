import {Button, Input, Select, message} from 'antd';
import {useState} from 'react'
import { API_SERVER } from '../config/const';
import axios from 'axios'

const NUDFCreate = ({mtModelName, confirmNUDFCallBack})=> {
    const [selectedModel, setSelectedModel] = useState()

    const handleSetNUDF = () => {
        let nudfEntry = {}
        let nudfName = document.getElementById("nudf_name").value;
        let nudfInputType = document.getElementById("input_type").value;
        let nudfInputName = document.getElementById("input_name").value;
        axios
            .post(`${API_SERVER}/create_nudf`, {nudf_name: nudfName, input_type:nudfInputType, input_name: nudfInputName, selected_model:selectedModel})
            .then(response=> {
                console.log(response.data);
                message.success('nUDF Create Success!')
                nudfEntry['function'] = response.data['func_name'];
                nudfEntry['model'] = response.data['model_name'];
                confirmNUDFCallBack(nudfEntry);
            })
            .catch(err=> {
                console.log(err)
            })
    }

    const handleModelChange = (value) => {
        setSelectedModel(value);
    }

   
    return (
        <div style={{display: 'flex', height:'100%'}}>
            <div style={{width:'90%', height:'100%', marginLeft:'5%'}}>
                <div className='module-content' style={{margin: '8px 5px', height: '15%', display:'flex', alignItems:'center'}}>
                    <span style={{width: '47%'}}>Function Name</span> 
                    <Input id="nudf_name" style={{width: '53%', height:'90%'}} placeholder=""/> 
                </div>
                <div className='module-content' style={{margin: '8px 5px', height: '15%', display:'flex', alignItems:'center'}}>
                    <span style={{width: '47%'}}>Input Type</span> 
                    <Input id="input_type" style={{width: '53%', height:'90%'}} placeholder=""/> 
                </div>
                <div className='module-content' style={{margin: '8px 5px', height: '15%', display:'flex', alignItems:'center'}}>
                    <span style={{width: '47%'}}>Input Name</span> 
                    <Input id="input_name" style={{width: '53%', height:'90%'}} placeholder=""/> 
                </div>
                <div className='module-content' style={{margin: '8px 5px', height: '15%', display:'flex', alignItems:'center'}}>
                    <span style={{width: '47%'}}>Model</span> 
                    <Select
                        // defaultValue=""
                        id="nudf_model"
                        style={{
                            width: '53%',
                        }}
                        onChange={handleModelChange}
                        options={mtModelName}
                    /> 
                </div>
             
                <div className='module-content' style={{margin: '8px 5px', height: '20%'}}>
                    <Button className='module-button' onClick={handleSetNUDF} style={{marginLeft:'148.5px', height:'30px'}}>Create</Button>
                </div>
            </div>

            
        </div>
    )
}

export default NUDFCreate;