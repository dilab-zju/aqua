import {useState} from 'react'
import OPDetail from './opDetail';
import {Table, Space, Switch, Select, Progress} from 'antd'
import {CaretRightFilled} from "@ant-design/icons";
import { rgb } from "d3";
import { connect } from 'react-redux';
import {setOPData, setOPDetail, addOPRecord} from '../actions';
import OPGraph from './opGraph';
import axios from 'axios';
import { API_SERVER } from '../config/const';

const Optimize = ({opData, setOPData, opDetail, setOPDetail, opRecord, addOPRecord}) => {
    const [selectedNUDF, setSelectedNUDF] = useState()
    const [opSettings, setOPSettings] = useState([false, false, false]);
  
    const [progressData, setProgressData] = useState(0);
    const [showProgress, setShowProgress] = useState(0);
    const [showGraph, setShowGraph] = useState(0);
    const [detailGraph, setDetailGraph] = useState(0);

    const [nodesDataOP, setNodesDataOP] = useState([[],[],[]]);
    const [edgesDataOP, setEdgesDataOP] = useState([[],[],[]]);

    const [opDetailText, setOPDetailText] = useState([])

    const opSetColumns = [
        {
            title: 'Technique',
            dataIndex: 'rule',
            key: 'rule',
            width: "35%",
            align:'center'
        },
        {
            title: 'Setting',
            key: 'set',
            render: (_, record) => (
                <Space size="middle">
                    <Switch onChange={()=>handleOPSetChange(record)} size="small"></Switch>
                </Space>
            ),
            width: "30%",
            align:'center'
        }
    ];
    
    const opSetData = [
        {"key":0, "rule":"Operator Fusion"},
        {"key":1, "rule":"Tensor Fusion"}, 
        {"key":2, "rule":"Tensor Compression"}
    ]

    const opRecordColumns = [
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            width: "16%",
            align:'center'
        },
        {
            title: 'nUDF',
            dataIndex: 'nUDF',
            key: 'nUDF',
            width: "12%",
            align:'center'
        },
        {
            title: 'OP Rule',
            dataIndex: 'rule',
            key: 'rule',
            width: "30%",
            align:'center'
        },
        {
            title: '# Parameters',
            dataIndex: 'score',
            key: 'score',
            render: (text, record) => (
                <Space>
                  <span style={{ color: rgb(22,93,255,1) }}>{text} &rarr; 0.67M </span>
                </Space>
            ),
            width: "16%",
            align:'center'
        },
        {
            title:'Size',
            dataIndex:'size',
            key:'size',
            render: (text, record) => (
                <Space>
                  <span style={{ color: rgb(22,93,255,1) }}>{text} </span>
                </Space>
            ),
            width:'8%',
            align:'center'
        },
        {
            title:'DL2SQL Size',
            dataIndex:'o_size',
            key:'o_size',
            width:'16%',
            align:'center'
        },
        {
            title: 'Operation',
            key: 'operation',
            render: (_, record) => (
                <Space size="middle">
                  <a href="https://cc98.org">Detail</a>
                </Space>
            ),
            width: "12%",
            align:'center'
        }
    ];

    const nUDFOptions = [{value: "Object", label: "Object"}, {value: "Color", label: "Color"}]

    async function handleStartOP() {
        let rules = ["Operator Fusion", "Tensor Fusion", "Tensor Compression"] 
        let selectedRules = []
        for (let i=0; i<3; i++) {
            if (opSettings[i]) {
                selectedRules.push(rules[i]);
            }
        }
        
        for (let i=1; i<3; i++) {
            console.log(i);
            let opConfig = {'nudf':selectedNUDF, 'op_settings':selectedRules[i-1]};
            setShowProgress(1<<i);
            await startProgress();
            
            axios
            .post(`${API_SERVER}/start_optimization`, opConfig)
            .then(response => {
                console.log(response.data);
                let nodesData = response.data["nodes_data"];
                let edgesData = response.data["edges_data"];
                setNodesDataOP(prevNodesDataOP => {
                    const updatedNodesDataOP = [...prevNodesDataOP];
                    updatedNodesDataOP[i] = nodesData;
                    return updatedNodesDataOP;
                    });
                    setEdgesDataOP(prevEdgesDataOP => {
                    const updatedEdgesDataOP = [...prevEdgesDataOP];
                    updatedEdgesDataOP[i] = edgesData;
                    return updatedEdgesDataOP;
                    });
            })
            .catch(err=> {
                console.log(err)
            })
            
            setShowProgress(0);
            setShowGraph((2<<i) - 1);
        }

        let currentTime = getCurrentTime();
        let newRecord = {"date":currentTime, "nUDF":"Object", "rule":selectedRules.join(","), "score":'1.15M', "size":'8.9MB', "o_size":'103.7MB'};
        addOPRecord(newRecord);
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

    const handleNUDFChange = (value) => {
        setSelectedNUDF(value);
        
        axios
        .get(`${API_SERVER}/init_op?nudf_name=${value}`)
        .then(response => {
            let nodesData = response.data["nodes_data"];
            let edgesData = response.data["edges_data"];
            setNodesDataOP([nodesData, nodesDataOP[1], nodesDataOP[2]]);
            setEdgesDataOP([edgesData, edgesDataOP[1], edgesDataOP[2]]);
            setShowGraph(1);
        })
    }

    const handleOPSetChange = (value) => {
        let newOPSettings = [...opSettings];
        newOPSettings[value["key"]] = !newOPSettings[value["key"]]
        setOPSettings(newOPSettings);
    }

    const handleViewDetail = (e) => {
        let targetID = e
        axios
        .get(`${API_SERVER}/get_op_detail?key=op_${targetID}`)
        .then(response => {
            let details = response.data["op_details"];
            setOPDetailText(details);
        })

        if (targetID === 1) {
            setDetailGraph(1);
        } else if (targetID === 2) {
            setDetailGraph(2);
        }
    }

    const sleep = ms => new Promise(
        resolve => setTimeout(resolve, ms)
      );

    async function startProgress () {
        for(let i=0; i<5; i++) {
            setProgressData(20 + 20*i);
            await sleep(200);
        }
    }

    return (
        <div style={{width:'98%', height:'100%', background:'#fff', marginLeft:'1%'}}>
            <div className="create-title" style={{height: '4%', width: '100%', display:'flex', alignItems:'center'}}>
                    <span style={{marginLeft:10, marginTop: 5}}>Choose nUDF</span> 
                    <Select
                        size="small"
                        id="op_nudf"
                        style={{
                            width: '8%',
                            marginTop: '7px',
                            marginLeft: '10px',
                        }}
                        onChange={handleNUDFChange}
                        options={nUDFOptions}
                    /> 
                    <span style={{marginLeft:183, marginTop: 5}}>Start Optimization</span> 
                    <CaretRightFilled 
                        onClick={()=>{
                            handleStartOP()
                        }}
                        style={{marginLeft:5, marginTop: 5, fontSize: 23, color:rgb(22,93,255,1)}}
                    />
            </div>

            <div style={{width:'100%', height:'30%', display:'flex', margin:'8px 10px'}}>
                <div className="module-border" style={{height:'100%', width: '30%'}}>
                    <div className="module-title" style={{height: '10%', display:'flex', alignItems:'center'}}>
                        <span style={{marginLeft:5}}>Optimization Techniques</span> 
                    </div>
                    <Table style={{margin: '5px 30px'}}
                        pagination={false}
                        // pagination={{pageSize:3}} 
                        columns={opSetColumns} 
                        dataSource={opSetData}
                        size="small"
                    >
                    </Table>
                </div>

                <div className="module-border" style={{height:'100%', width: '66%', marginLeft: '2%'}}>
                    <div className="module-title" style={{height: '10%', display:'flex', alignItems:'center'}}>
                        <span style={{marginLeft:5}}>Optimizations Applied</span> 
                    </div>

                    <Table style={{margin: '5px 10px'}}
                        scroll={{x:'100%',y:120}}
                        pagination={false}
                        // pagination={{pageSize:3}} 
                        columns={opRecordColumns} 
                        dataSource={opRecord}
                        size="small"
                    >
                    </Table>
                </div>
            </div>

            <div style={{width:'100%', height:'63.15%', display:'flex', margin:'8px 10px'}}>
                <div className="module-border" style={{height:'100%', width: '73.5%'}}>
                    <div className="module-title" style={{height: '5%', display:'flex', alignItems:'center'}}>
                        <span style={{marginLeft:5}}>Optimization Process</span> 
                    </div>
                    <div style={{width:'100', height: '90%', display:'flex', alignItems:'center'}}>
                        {/* original graph */}
                        <div className="module-border" style={{width:'24%', height: '98%', marginLeft:'1%'}}>
                            <div style={{display:showGraph&1? 'block':'none', height: '100%', overflow:"scroll"}}>
                                <OPGraph nodesData={nodesDataOP[0]} edgesData={edgesDataOP[0]}></OPGraph>
                            </div>
                        </div>
                        {/* graph 1*/}
                        <div className={detailGraph === 1 ? 'module-border-selected':'module-border'} id="opGraph1"
                            style={{width:'24%', height: '98%', marginLeft:'1%'}} onClick={()=>handleViewDetail(1)}
                        >
                            <div style={{padding: '55% 40%', display:showProgress&2? 'block': 'none'}}>
                                <Progress type="circle" percent={progressData} width={60}/>
                            </div>
                            <div style={{display:(showGraph&2)>>1? 'block': 'none', height: '100%', overflow:"scroll"}}>
                                <OPGraph nodesData={nodesDataOP[1]} edgesData={edgesDataOP[1]}></OPGraph>
                            </div>
                        </div>
                        {/* graph 2*/}
                        <div className={detailGraph === 2 ? 'module-border-selected':'module-border'} id="opGraph2"
                             style={{width:'24%', height: '98%', marginLeft:'1%'}} onClick={()=>handleViewDetail(2)}
                        >
                            <div style={{padding: '55% 40%', display:showProgress&4? 'block': 'none'}}>
                                <Progress type="circle" percent={progressData} width={60}/>
                            </div>
                            <div style={{display:(showGraph&4)>>2 ? 'block':'none', height: '100%', overflow:"scroll"}}>
                                <OPGraph nodesData={nodesDataOP[2]} edgesData={edgesDataOP[2]}></OPGraph>
                            </div>
                        </div>
                        {/* graph 3*/}
                        <div className="module-border" style={{width:'23%', height: '98%', marginLeft:'1%'}}>
                            <div style={{padding: '55% 40%', display:showProgress&8? 'block': 'none'}}>
                                <Progress type="circle" percent={progressData} width={60}/>
                            </div>
                        </div>

                    </div>
                    
                    {/* text for which op */}
                    <div style={{width:'100%', height: '5%', display:'flex'}}>
                        <div style={{width:'15%', marginLeft:'10%', display:showGraph&1? 'block':'none'}}>
                            <span className='op-stage'>Origin</span>
                        </div>
                        <div style={{width:'20%', marginLeft:'6%', display:showGraph&2? 'block':'none'}}>
                            <span className='op-stage'>Stage1:Operator Fusion</span>
                        </div>
                        <div style={{width:'20%', marginLeft:'5%', display:showGraph&4? 'block':'none'}}>
                            <span className='op-stage'>Stage2:Tensor Fusion</span>
                        </div>
                    </div>
                </div>

                <div className="module-border" style={{height:'100%', width: '23%', marginLeft: '1.5%'}}>
                    <OPDetail showDetail={detailGraph&1} details={opDetailText}></OPDetail>
                </div>
            </div>
        </div>
        
    )
}

const mapStateToProps = state => {
    return {
      opData: state.opData,
      opDetail: state.opDetail,
      opRecord: state.opRecord
    }
}

const mapDispatchToProps = dispatch => {
    return {
        setOPData: opData => {
            dispatch(setOPData(opData))
        },
        setOPDetail: opDetail => {
            dispatch(setOPDetail(opDetail))
        },
        addOPRecord: opRecord => {
            dispatch(addOPRecord(opRecord))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Optimize);