import {CaretRightFilled, LoadingOutlined} from "@ant-design/icons";
import { rgb } from "d3";
import AceEditor from "react-ace";
import 'ace-builds/webpack-resolver'
import 'ace-builds/src-noconflict/mode-sql'; // sql模式的包
import 'ace-builds/src-noconflict/mode-mysql';// mysql模式的包

import axios from 'axios'
import { API_SERVER } from '../config/const';

import {Table, Space} from 'antd'
import { connect } from 'react-redux';
import { useState } from "react";
import {
    TableOutlined
} from "@ant-design/icons";
import QueryPlanGraph from "./queryPlanGraph";

const Query = () => {
    const [exe1, setExe1] = useState(false);
    const [exe2, setExe2] = useState(false);
    const [showLog1, setShowLog1] = useState(false);
    const [showLog2, setShowLog2] = useState(false);
    const [showQueryRes, setShowQueryRes] = useState(false);
    const [queryRecordData, setQueryRecordData] = useState([]);
    
    const defaultCQ = "SELECT Object(C.image) as class, count(C.id) as number\
        \nFROM test C\
        \nWHERE C.create_date >= '2022-01-01'\
        \n  and C.create_date <= '2022-12-31'\
        \nGROUP BY class"
    const [CQ, setCQ] = useState(defaultCQ);
    const [queryResColumns, setQueryResColumns] = useState([]);
    const [queryResData, setQueryResData] = useState([]);
    const [queryResTime, setQueryResTime] = useState(0);
    const [queryPlanNodesData, setQueryPlanNodesData] = useState([]);
    const [queryPlanEdgesData, setQueryPlanEdgesData] = useState([]);

    const nUDFTableColumns = [
        {
            title: 'Name',
            dataIndex: 'nudf',
            key: 'nudf',
            width: '30%',
            align: 'center'
        },
        {
            title: 'Model',
            dataIndex: 'model',
            key: 'model',
            width: '30%',
            align: 'center'
        }
    ];

    const nUDFTableData = [{key:1, nudf:"Object", model:"CNN_object"}, {key:2, nudf:"Color", model:"CNN_color"}]

    const storageTableColumns = [
        {
            title: 'Name',
            dataIndex: 'tName',
            key: 'tName',
            width: '60%',
            render: (text, record) => (
                <Space>
                  <TableOutlined style={{color:rgb(22,93,255,1)}}/>
                  {text}
                </Space>
            ),
        },
        {
            title: '# Records',
            dataIndex: 'numRecords',
            key: 'numRecords',
            width: '40%',
            align: 'center'
        }
    ];

    const storageTableData = [  {key:1, tName:"conv1_0_kernel", numRecords:864},
                                {key:2, tName:"conv1_2_kernel", numRecords:128},
                                {key:3, tName:"conv1_2_map", numRecords:36864},
                                {key:4, tName:"conv2_0_kernel", numRecords:52775},
                                {key:5, tName:"conv2_0_mapping", numRecords:18775},
                                {key:6, tName:"conv2_0_mapping", numRecords:18775}]

    const queryRecordColumns = [
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            width: "25%",
            align:'center'
        },
        {
            title: 'Query Type',
            dataIndex: 'queryType',
            key: 'queryType',
            width: "20%",
            align:'center'
        },
        {
            title: '# Lines',
            dataIndex: 'numLines',
            key: 'numLines',
            width: "15%",
            align:'center'
        },
        {
            title: 'Execution Time',
            dataIndex: 'exeTime',
            key: 'exeTime',
            width: "25%",
            align:'center'
        },
    ];

    // const queryRecordData = [{key:1, date:'2022-12-31 18:31', queryType:"Collaborative", numLines:6, exeTime:"1.27s"},
    //                         {key:2, date:'2022-12-31 18:40', queryType:"Native", numLines:550, exeTime:"6.05s"}]

    const handleInputCQChange = (newCQ) => {
        setCQ(newCQ);
    }

    const generateQueryResColumn = (column_name) => {
        let config = {}
        config.align = 'center'
        config.width = '50%'

        return {title:column_name, dataIndex:column_name, key:column_name, ...config}
    }

    const handleCQ = () => {
        let queryTime = 0;
        setExe1(true);
        setShowQueryRes(false);
        let lenCQ = CQ.split('\n').length;
         
        axios
        .get(`${API_SERVER}/execute_query?query=${encodeURIComponent(CQ)}`)
        .then(response=> {
            //console.log(response.data)
            queryTime = response.data['query_time'].toFixed(2);
            setQueryResTime(queryTime);
            let colData = response.data['query_res_col'];
            let CQResData = response.data['query_res_data'];
            const tempQueryResColumns = colData.map(column => generateQueryResColumn(column));
            setQueryResColumns(tempQueryResColumns);
            setQueryResData(CQResData);
        })
        .then(() => {
            setExe1(false);
            setShowLog1(true);
            setShowQueryRes(true);
            setQueryRecordData([...queryRecordData, {key:1, date:getCurrentTime(), queryType:"Collaborative", numLines:lenCQ, exeTime:queryTime}])
            handleQueryPlan()
        })
        .catch(err=> {
            console.log(err)
        })
    }

    const handleDL2SQL = () => {
        setExe2(true);
        setShowQueryRes(false);
        setTimeout(()=> {
            setExe2(false);
            setShowLog2(true);
            setShowQueryRes(true);
            setQueryRecordData([...queryRecordData,  {key:2, date:getCurrentTime(), queryType:"DL2SQL", numLines:550, exeTime:"6.05s"}])
        }, 6050)
    }

    const getCurrentTime = () => {
        let date = new Date();
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        month = month < 10 ? "0" + month : month;
        let day = date.getDate();
        day = day < 10 ? "0" + day : day;
        let hour = date.getHours();
        hour = hour < 10 ? "0" + hour : hour;
        let minute = date.getMinutes();
        minute = minute < 10 ? "0" + minute : minute;
        let currentTime = `${year}-${month}-${day} ${hour}:${minute}`;
        return currentTime;
    }

    const handleQueryPlan = () => {
        axios
        .get(`${API_SERVER}/explain_query?query=${encodeURIComponent(CQ)}`)
        .then(response=> {
            // console.log(response.data)
            let nodesData = response.data['nodes_data'];
            let edgesData = response.data['edges_data'];
            setQueryPlanNodesData(nodesData);
            setQueryPlanEdgesData(edgesData);
        })
        .catch(err=> {
            console.log(err)
        })
    }

    return (
        <div style={{width:'98%', height:'100%', background:'#fff', marginLeft:'1%'}}>
            <div className="create-title" style={{height: '4%', width: '100%', display:'flex', alignItems:'center'}}>
                    <div style={{width:'30%', height:'80%', display:'flex'}}>
                        <span style={{marginLeft:11, marginTop: 0, verticalAlign:'top'}}>Collaborative Query Approach</span> 
                        <CaretRightFilled 
                            onClick={()=>{
                                handleCQ();
                            }}
                            style={{marginLeft:5, marginTop: 3, fontSize: 23, color:rgb(22,93,255,1)}}
                        />
                    
                        <LoadingOutlined
                            style={{display: exe1? 'block':'none',
                                marginLeft:5, marginTop: 8, fontSize: 18, color:rgb(22,93,255,1)}}
                        />
                    </div>

                    <div style={{width:'30%', height:'80%', display:'flex'}}>
                        <span style={{marginLeft:5, marginTop: 0, verticalAlign:'top'}}>DL2SQL Approach</span> 
                        <CaretRightFilled 
                            onClick={()=>{
                                handleDL2SQL();
                            }}
                            style={{marginLeft:5, marginTop: 3, fontSize: 23, color:rgb(22,93,255,1)}}
                        />
                    
                        <LoadingOutlined
                            style={{display: exe2? 'block':'none',
                                marginLeft:5, marginTop: 8, fontSize: 18, color:rgb(22,93,255,1)}}
                        />
                    </div>
                   
                     
            </div>
            <div style={{width:'100%', height:'95%', display:'flex'}}>

                <div style={{width:'60%', height:'100%', display:'flex', flexDirection:'column', margin:'8px 10px'}}>
                    {/* two query input */}
                    <div style={{width:'100%', height:'62%', display:'flex', flexDirection:'row'}}>
                        {/* collaborative sql */}
                        <div className="module-border" style={{height:'100%', width: '49%'}}>
                            <AceEditor
                                id="queryEditorr"
                                value={CQ}
                                onChange={handleInputCQChange}
                                mode="mysql"
                                theme="github"
                                style={{width:'100%', height:'70%'}}
                                name="UNIQUE_ID_OF_DIV"
                                editorProps={{ $blockScrolling: true }}
                            />
                            <div className="module-border-part" style={{width: '100%'}}>
                                <div className="module-title" style={{height: '10%', display:'flex', alignItems:'center'}}>
                                    <span style={{marginLeft:5}}>Logs</span> 
                                </div>
                                <div style={{display:showLog1? 'block':'none'}}>
                                    <span style={{marginLeft:20}}>{"[INFO]"}</span>
                                    <span style={{marginLeft:10, color:'red'}}>{"total 5 lines, execution time=" + queryResTime +"s"}</span>
                                </div>
                            </div>
                        </div>  
                        {/* native complex sql */}
                        <div className="module-border" style={{height:'100%', width: '49%', marginLeft:'1.5%'}}>
                            <AceEditor
                                id="queryEditorr"
                                // value={nudfSql}
                                // onChange={handleAceChange}
                                mode="mysql"
                                theme="github"
                                style={{width:'100%', height:'70%'}}
                                name="UNIQUE_ID_OF_DIV"
                                editorProps={{ $blockScrolling: true }}
                            />
                            <div className="module-border-part" style={{width: '100%'}}>
                                <div className="module-title" style={{height: '10%', display:'flex', alignItems:'center'}}>
                                    <span style={{marginLeft:5}}>Logs</span> 
                                </div>
                                <div style={{display:showLog2? 'block':'none'}}>
                                    <span style={{marginLeft:20}}>{"[INFO]"}</span>
                                    <span style={{marginLeft:10, color:'red'}}>{"total 550 lines, execution time=6.05s"}</span>
                                </div>
                            </div>
                        </div>  
                    </div>

                    <div className="module-border" style={{height:'35%', width: '100%', marginTop: '10px'}}>
                        <div className="module-title" style={{height: '10%', display:'flex', alignItems:'center'}}>
                            <span style={{marginLeft:5}}>Query Plan</span> 
                        </div>
                        {/* <div id="model_view" style={{display: showLog1? 'block':'none', height: '90%', overflow:"scroll", background: '#e7e6e6'}}> */}
                        <div id="model_view" style={{display: 'bolck', height: '90%', overflow:"scroll", background: '#e7e6e6'}}>        
                                <QueryPlanGraph 
                                    nodesData={queryPlanNodesData} 
                                    edgesData={queryPlanEdgesData}>
                                </QueryPlanGraph>
                        </div>
                    </div>  
                </div>

                <div style={{width:'40%', height:'100%', display:'flex', margin:'8px 10px'}}>
                    <div className="module-border" style={{height:'98.2%', width: '100%'}}>
                        
                        <div className="module-border" style={{height:'30%', width: '96%', margin:'2% 2%'}}>
                            <div className="module-title" style={{height: '10%', display:'flex', alignItems:'center'}}>
                                <span style={{marginLeft:5}}>Query Results</span> 
                            </div>
                            <Table style={{margin: '5px 50px', display:showQueryRes? 'block':'none'}}
                                scroll={{x:'max-content',y:120}}
                                pagination={false} 
                                columns={queryResColumns} 
                                dataSource={queryResData}
                                size="small"
                            >
                            </Table>
                        </div>  

                        <div style={{height:'32%', width: '100%', margin:'2% 2%', display:'flex'}}>
                            <div className="module-border" style={{height:'100%', width: '43%'}}>
                                <div className="module-title" style={{height: '10%', display:'flex', alignItems:'center'}}>
                                    <span style={{marginLeft:5}}>nUDF Library</span> 
                                </div>
                                <Table style={{margin: '5px 10px'}}
                                    scroll={{x:'max-content',y:120}}
                                    pagination={false} 
                                    columns={nUDFTableColumns} 
                                    dataSource={nUDFTableData}
                                    size="small"
                                >
                                </Table>
                            </div> 
                            <div className="module-border" style={{height:'100%', width: '51%', marginLeft:'1%'}}>
                                <div className="module-title" style={{height: '10%', display:'flex', alignItems:'center'}}>
                                    <span style={{marginLeft:5}}>Storage Tables</span> 
                                </div>
                                <Table style={{margin: '5px 10px'}}
                                    scroll={{x:'100%',y:125}}
                                    pagination={false} 
                                    columns={storageTableColumns} 
                                    dataSource={storageTableData}
                                    size="small"
                                >
                                </Table>
                            </div> 
                        </div> 

                        <div className="module-border" style={{height:'32%', width: '96%', margin:'2% 2%'}}>
                            <div className="module-title" style={{height: '10%', display:'flex', alignItems:'center'}}>
                                <span style={{marginLeft:5}}>History</span> 
                            </div>
                            <Table style={{margin: '5px 10px'}}
                                scroll={{y:120}}
                                pagination={false}
                                // pagination={{pageSize:3}} 
                                columns={queryRecordColumns} 
                                dataSource={queryRecordData}
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
      nUDFTableData: state.ftData.map((item)=> {return {key: item.key, nudf: item.function, model: item.model, query_length: 3449}})
    }
}

export default connect(mapStateToProps)(Query);