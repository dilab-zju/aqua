import './Create.css'
import {Table, Space} from 'antd'
import {useState} from 'react'
import ModelUpload from './modelUpload';
import NUDFCreate from './nUDFCreate';
// import CTableCreate from './cTableCreate';
import { connect } from 'react-redux';
import {addMTEntry, addFTEntry, addDBTABLE} from '../actions'
import AceEditor from "react-ace";
import ModelCGraph from './modelCGraph';

import 'ace-builds/webpack-resolver'
import 'ace-builds/src-noconflict/mode-sql'; // sql模式的包
import 'ace-builds/src-noconflict/mode-mysql';// mysql模式的包
import { API_SERVER } from '../config/const';
import axios from 'axios'
import {
    TableOutlined
} from "@ant-design/icons";
import { rgb } from 'd3'

const Create = ({mtData, ftData, mtModelName, dbTable, confirmNewModel, confirmNewNUDF}) => {
    const [nudfSql, setNUDFSql] = useState("");
    const [viewTableData, setViewTableData] = useState([])
    const [isSchemaShow, setIsSchemaShow] = useState(false)
    const [isDataShow, setIsDataShow] = useState(false)
    const [mGraphNodesData, setMGraphNodesData] = useState([])
    const [mGraphEdgesData, setMGraphEdgesData] = useState([])

    const [dbSchemaData, setDBSchemaData] = useState([])
    const [dbSampleColumns, setDBSampleColumns] = useState([])
    const [dbSampleData, setDBSampleData] = useState([])
    
    const dbColumns = [
        {
            title: <span style={{textAlign: 'center'}}>Name</span>,
            dataIndex: 'table_name',
            key: 'table_name',
            width: '30%',
            render: (text, record) => (
                <Space>
                  <TableOutlined style={{color:rgb(22,93,255,1)}}/>
                  {text}
                </Space>
              )
        },
        {
            title: 'Operation',
            key: 'operation',
            render: (_, record) => (
                <Space size="small">
                  <a onClick={()=>handleViewTableSchema(record)}>Schema</a>
                  <a onClick={()=>handleViewDBData(record)}>Data</a>
                </Space>
            ),
            width: "30%"
            ,align: 'center'
        }
    ];

    const dbSchemaColumns = [
        {
            title: 'Column Name',
            dataIndex: 'column_name',
            key: 'column_name',
            align: 'center'
        },
        {
            title: 'Data Type',
            dataIndex: 'data_type',
            key: 'data_type',
            align: 'center'
        },
        {
            title: 'Column Type',
            dataIndex: 'column_type',
            key: 'column_type',
            render: (text) => {
                if (text === 'relational') {
                    return <span style={{ color: rgb(22,93,255,1) }}>{text}</span>;
                } else if (text === 'virtual') {
                    return <span style={{ color: 'red' }}>{text}</span>;
                }
                return text;
            },
            align: 'center'
        },
    ];

    const mtColumns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            width: "20%",
            align: 'center'
        },
        {
            title: '# Layers',
            dataIndex: 'num_layer',
            key: 'num_layer',
            width: "16%",
            align: 'center'
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            width: "28%",
            align: 'center'
        },
        {
            title: 'Operation',
            key: 'operation',
            render: (_, record) => (
                <Space size="small">
                  <a href="https://cc98.org">Delete</a>
                  <a onClick={()=>handleMGraphView(record)}>View</a>
                </Space>
            ),
            width: "20%",
            align: 'center'
        }
    ];

    const ftColumns = [
        {
            title: 'Function',
            dataIndex: 'function',
            key: 'function',
            width: '30%',
            align: 'center'
        },
        {
            title: 'Model',
            dataIndex: 'model',
            key: 'model',
            width: '30%',
            align: 'center'
        },
        {
            title: 'Operation',
            key: 'operation',
            render: (_, record) => (
                <Space size="middle">
                  <a href="https://cc98.org">Modify</a>
                  <a href="https://cc98.org">Delete</a>
                  <a onClick={()=>handleNUDFView(record)}>View</a>
                </Space>
            ),
            width: '40%',
            align: 'center'
        }
    ];

    const handleMGraphView = (e)=> {
        axios
        .get(`${API_SERVER}/get_mgraph_data?name=${e.name}`)
        .then(response=> {
            let nodes_data = response.data['nodes_data'];
            let edges_data = response.data['edges_data'];
            setMGraphNodesData(nodes_data);
            setMGraphEdgesData(edges_data);
        })
        .catch(err=> {
            console.log(err)
        })
    }

    const handleViewTableSchema = (e) => {
        let tableName = e.table_name
        if (tableName === "CIFAR") {
            tableName = "test";
        }
        axios
        .get(`${API_SERVER}/get_table_schema?table_name=${tableName}`)
        .then(response=> {
            let schemaData = response.data['schema_data'];
            setDBSchemaData(schemaData);
        })
        .catch(err=> {
            console.log(err)
        })
        setIsSchemaShow(true)
    }

    const handleViewDBData = (e) => {
        let tableName = e.table_name
        if (tableName === "CIFAR") {
            tableName = "test";
        }
        axios
        .get(`${API_SERVER}/get_sample_data?table_name=${tableName}`)
        .then(response=> {
            let colData = response.data['col_data'];
            let sampleData = response.data['sample_data'];
            const tempSampleColumns = colData.map(column => generateSampleColumn(column));
            console.log(sampleData);
            console.log(tempSampleColumns);
            setDBSampleColumns(tempSampleColumns);
            setDBSampleData(sampleData);
        })
        .catch(err=> {
            console.log(err.response.data['exception'])
        })
        setIsDataShow(true)
    }

    const handleNUDFView = (e)=> {
        axios
            .post(`${API_SERVER}/nudf_get`, {function:"classify"})
            .then(response=> {
                console.log(response.data);
                let nUDFView = response.data['nudf_view'];
                setNUDFSql(nUDFView);
            })
            .catch(err=> {
                console.log(err)
            })
    }

    const generateSampleColumn = (column) => {
        let config = {}
        config.align = 'center'
        if (column.is_virtual) {
            let customRenderer = (text, record) => (
                <Space>
                  <span style={{ color: 'red' }}>virtual</span>
                  &rarr;
                  <TableOutlined style={{color:rgb(22,93,255,1)}}/>
                  CIFAR_feature
                </Space>
            );
            config.width = '50%';
            config.render = customRenderer;
        } else {
            config.width = '30%';
        }

        return {title:column.title, dataIndex:column.title, key:column.title, ...config}
    }

    async function handleClickTableList() {
        await genRandomTableData()
        document.getElementById("example_table_data").style.display = "block"
    }

    async function genRandomTableData() {
        let tTable = []
        let idx = 0
        for (let i=1; i<=10; i++) {
            for (let j=1; j<=9; j++) {
                tTable.push({key:idx++, matrixID:i, orderID:j, value:Math.random().toFixed(4)})
            }
        }
        setViewTableData(tTable)
    }

    return (
        <div style={{width:'98%', height:'100%', display:'flex', flexDirection:'column', marginLeft:'1%'}}>
            {/* Dataset */}
           <div className="dataset" style={{width:'100%', height:'35%', display:'flex', flexDirection:'column', background:"#fff"}}>

                <div className="create-title" style={{width:'100%', height: '15%',display:'flex',  alignItems:'center'}}>
                    <span style={{marginLeft:10}}>Dataset</span> 
                </div>
                
                <div style={{width:'100%', height:'90%', display:'flex'}}>
                    {/* Table Library */}
                    <div className="module-border" style={{width:'30%', height:'90%', display:'flex', flexDirection:'column', marginLeft:10}}>
                        <div className="module-title" style={{width:'100%', height: '10%', alignItems:'center'}}>
                            <span style={{marginLeft:5}}>Table Library</span> 
                        </div>
                        <Table style={{margin: '5px 20px'}}
                                    scroll={{x:'100%',y:120}}
                                    pagination={false}
                                    columns={dbColumns} 
                                    dataSource={dbTable}
                                    size="small"
                                >
                        </Table>
                    </div>

                    {/* Table Schema */}
                    <div className="module-border" style={{width:'30%', height:'90%', display:'flex', flexDirection:'column', marginLeft:10}}>
                        <div className="module-title" style={{width:'100%', height: '10%', alignItems:'center'}}>
                            <span style={{marginLeft:5}}>Table Schema</span> 
                        </div>
                        <Table style={{margin: '5px 20px', display:isSchemaShow? 'block':'none'}}
                                    scroll={{x:'100%',y:120}}
                                    pagination={false}
                                    columns={dbSchemaColumns} 
                                    dataSource={dbSchemaData}
                                    size="small"
                                >
                        </Table>
                    </div>

                    {/* Data Samples */}
                    <div className="module-border" style={{width:'36.5%', height:'90%', display:'flex', flexDirection:'column', marginLeft:10}}>
                        <div className="module-title" style={{width:'100%', height: '10%', alignItems:'center'}}>
                            <span style={{marginLeft:5}}>Data Samples</span> 
                        </div>
                        <Table style={{margin: '5px 20px', display:isDataShow? 'block':'none'}}
                                    scroll={{x:'100%',y:120}}
                                    pagination={false}
                                    columns={dbSampleColumns} 
                                    dataSource={dbSampleData}
                                    size="small"
                                >
                        </Table>
                    </div>

                </div>
            </div>

            <div style={{width:'100%', height:'1.5%'}}>
                
            </div>

            <div className="create_nUDF" style={{width:'100%', height:'63.5%', background:"#fff"}}>
                
                <div className="create-title" style={{height: '5%', display:'flex', alignItems:'center'}}>
                    <span style={{marginLeft:10, marginTop: 7}}>nUDF Creation</span> 
                </div>

                <div style={{height:'95%', display:'flex'}}>
                    {/* Model Loader */}
                    <div style={{width: '56%',height:'97%', margin:'8px 10px', display:'flex', flexDirection:'column'}}>
                        
                        <div style={{width:'100%', height:'55%', display:'flex'}}>
                            <div className="module-border" style={{width:'39.5%'}}>
                                <div className="module-title" style={{height: '10%', display:'flex', alignItems:'center'}}>
                                    <span style={{marginLeft:5}}>Import Model</span> 
                                </div>
                                <div style={{height: '90%', width:'100%'}}>
                                    <ModelUpload 
                                        confirmModelCallBack={confirmNewModel}>
                                    </ModelUpload>
                                </div>
                            </div>
                                    
                            <div className="module-border" style={{width:'60.5%', marginLeft:'1%'}}>
                                <div className="module-title" style={{height: '10%', display:'flex', alignItems:'center'}}>
                                        <span style={{marginLeft:5}}>Model Library</span> 
                                </div>
                                <Table style={{margin: '5px 20px'}}
                                    scroll={{x:'100%',y:120}}
                                    pagination={false}
                                    // pagination={{pageSize:3}} 
                                    columns={mtColumns} 
                                    dataSource={mtData}
                                    size="small"
                                >
                                </Table>
                            
                            </div>
                        </div>

                        <div className="module-border" style={{width:'100%', height:'42.5%', marginTop:10}}>
                            <div className="module-title" style={{height: '10%', display:'flex', alignItems:'center'}}>
                                <span style={{marginLeft:5}}>View Model</span> 
                            </div>
                            <div id="model_view" style={{visibility:'block', height: '90%',width:'100%', overflow:"auto", paddingTop:5}}>
                                <ModelCGraph nodesData={mGraphNodesData} edgesData={mGraphEdgesData}></ModelCGraph>
                            </div>
                        </div>
                    </div>

                    {/* nUDF Processor*/}
                    <div style={{width: '41%',height:'97%', margin:'8px 5px', display:'flex', flexDirection:'column'}}>
                        
                        <div style={{width:'100%', height:'55%', display:'flex'}}>
                            <div className="module-border" style={{width:'50%',height:'100%'}}>
                                <div className="module-title" style={{height: '10%', display:'flex', alignItems:'center'}}>
                                    <span style={{marginLeft:5}}>Create nUDF</span> 
                                </div>
                                <div style={{height: '90%', width:'100%'}}>
                                <NUDFCreate 
                                    mtModelName={mtModelName}
                                    confirmNUDFCallBack={confirmNewNUDF}>
                                </NUDFCreate>
                                </div>
                            </div>
                            
                            {/*View nUDF */}
                            <div className="module-border" style={{width:'50%', marginLeft:'1%'}}>
                                <div className="module-title" style={{height: '10%', display:'flex', alignItems:'center'}}>
                                        <span style={{marginLeft:5}}>View nUDF</span> 
                                </div>
                                <div className='module-content' style={{margin: '8px 25px', height: '80%'}}>
                                    <AceEditor
                                        id="aceEditor"
                                        value={nudfSql}
                                        // onChange={handleAceChange}
                                        mode="mysql"
                                        theme="github"
                                        style={{width:'100%', height:'100%'}}
                                        name="UNIQUE_ID_OF_DIV"
                                        editorProps={{ $blockScrolling: true }}
                                    />
                                
                                </div>
                            
                            </div>
                            
                        </div>

                        <div className="module-border" style={{width:'100%', height:'42.5%', display:'flex', flexDirection:'column',marginTop:10}}>
                            <div className="module-title" style={{height: '10%', display:'flex', alignItems:'center'}}>
                                <span style={{marginLeft:5}}>nUDF Library</span> 
                            </div>
                            <Table style={{margin: '5px 50px'}}
                                scroll={{x:'max-content',y:90}}
                                pagination={false} 
                                columns={ftColumns} 
                                dataSource={ftData}
                                size="small"
                            >
                            </Table>
                            
                        </div>
                    </div>
                </div>
                
            </div>
            
        </div>
    )
}

const mapStateToProps = state => {
    return {
      mtData: state.mtData,
      ftData: state.ftData,
      dbTable: state.dbTable,
      mtModelName: state.mtData.map((item)=> {return {value: item.name, label: item.name}})
    }
}

const mapDispatchToProps = dispatch => {
    return {
      confirmNewModel: modelAttrs => {
        const entry = {name:modelAttrs['name'], num_layer:modelAttrs['num_layer'], description:modelAttrs['description']};
        dispatch(addMTEntry(entry))

        let dbTables = modelAttrs['db_tables']
        for (let i=0; i<modelAttrs['db_tables'].length; i++) {
            let tmpEntry = {table_name: dbTables[i]}
            dispatch(addDBTABLE(tmpEntry))
        }
      },
      confirmNewNUDF: nudfAttrs => {
        const entry = {function:nudfAttrs['function'], model:nudfAttrs['model']};
        dispatch(addFTEntry(entry))
      }
    }
  }

export default connect(mapStateToProps, mapDispatchToProps)(Create);