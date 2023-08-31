import {Upload, message, Button, Input, Progress} from 'antd';
import {UploadOutlined} from '@ant-design/icons';
import { API_SERVER } from '../config/const';
import axios from 'axios'
import {useState} from 'react'
const {TextArea} = Input

const ModelUpload = ({confirmModelCallBack})=> { 
    const [isLoading, setIsLoading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [modelAttr, setModelAttr] = useState({});
    const [DBTables, setDBTables] = useState([])
    const beforeUpload = (file)=> {
        return true;
    }

    const handleChange = (info)=> {
        if (info.file.status === 'uploading') {
            setUploadProgress(0);
            setIsLoading(true);
            return;
        }
        if (info.file.status === 'error') {
            setUploadProgress(0);
            setIsLoading(false);
            message.error('Upload Failed!');
        }
    }

    const uploadModel = (info)=> {
        setModelAttr({});
        let formData = new FormData();
        let headers = {
            'Content-Type': 'multipart/form-data'
          }
        formData.append('file', info.file);
        axios
            .post(`${API_SERVER}/model_upload`, formData, {headers:headers})
            .then(response=> {
                console.log(response.data);
                message.success('Upload Success!')
                setIsLoading(false);
                setUploadProgress(100);
                setModelAttr({'num_layer': response.data['num_layer']})
                setDBTables(response.data['table_names'])
            })
            .catch(err=> {
                console.log(err)
            })
    }

    const handleSetModel = () => {
        let name = document.getElementById("model_name").value;
        let description = document.getElementById("model_description").value
        if (name === "" || description === ""){
            message.error("Value can not be empty!");
            return;
        }
        if (uploadProgress === 0) {
            message.error("Please Upload Model First!");
            return;
        }
        let modelEntry = {}
        modelEntry['name'] = name;
        modelEntry['description'] = description;
        // modelEntry['num_layer'] = 10
        modelEntry['num_layer'] = modelAttr['num_layer']
        modelEntry['db_tables'] = DBTables
        confirmModelCallBack(modelEntry);
    }
    return (
        <div style={{marginLeft: 15, marginRight: 0}}>
            <div className='module-content' style={{margin: '5px 0px', height: '20%', display:'flex', alignItems:'center'}}>
                <span style={{width: '30%'}}>Model Name</span> 
                <Input id="model_name" style={{width: '60%', marginLeft:'10px'}} placeholder="Enter your model name"/> 
            </div>
            <div className='module-content' style={{margin: '10px 0px', height: '20%', display:'flex', alignItems:'center'}}>
                <span style={{width: '30%'}}>Description</span> 
                <TextArea id="model_description" style={{width: '60%', marginLeft:'10px'}} rows={2} placeholder="Give a brief summary of your model" /> 
            </div>
            <div className='module-content' style={{margin: '10px 0px', height: '60%', display:'flex', alignItems:'center'}}>
                <span style={{width: '30%'}}>Upload File</span> 
                <Upload
                name='file'
                beforeUpload={beforeUpload}
                customRequest={uploadModel}
                onChange={handleChange}
                showUploadList={false}
                >
                <Button className= 'module-button' style={{width:'85%', marginLeft:'24px'}} icon={<UploadOutlined/>}>Click to Upload</Button>
                </Upload>
            </div>
            <div className='module-content' style={{margin: '10px 25px', height: '20%'}}>
                <Button className='module-button' onClick={handleSetModel} style={{marginLeft:'144.5px'}}>Confirm</Button>
            </div>
        </div>
    )
}

export default ModelUpload;