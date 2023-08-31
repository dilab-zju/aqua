import React from "react";
import {Table} from 'antd'

const OPDetail = ({showDetail, details}) => {
    
    const metricColumn = [
        {
            title: 'stage',
            dataIndex: 'stage',
            key: 'stage',
            width: "20%",
            align:'center'
        },
        {
            title: '# parameters',
            dataIndex: 'num_para',
            key: 'num_para',
            width: "30%",
            align:'center'
        },
        {
            title: '# tables',
            dataIndex: 'num_table',
            key: 'num_table',
            width: "25%",
            align:'center'
        }
    ];

    const metricData = [{'key':1, 'stage':'Before', 'num_para':'1.15M', 'num_table':24},
                         {'key':2, 'stage':'After', 'num_para':'0.82M', 'num_table':20}]

    return (
        <div style={{width:'100%', height:'100%', overflow:"scroll", display: showDetail? 'block':'none'}}>
            <div className="module-title" style={{height: '5%', display:'flex', alignItems:'center'}}>
                        <span style={{marginLeft:5}}>Optimization Details</span> 
            </div>

            <div className="separator"></div>
            
            <div>
                <span className="op-detail" style={{marginLeft:10}}>Technique: Operator Fusion</span> 
            </div>
           

            <div>
                <span className="op-detail" style={{marginLeft:10}}>Metric:</span> 
                <Table  className="metric-table"
                        style={{margin: '10px 10px'}}
                        pagination={false}
                        columns={metricColumn} 
                        dataSource={metricData}
                        size="small"
                    >
                </Table>
            </div>

            <div className="separator"></div>

            <div>
                <span className="op-detail" style={{marginLeft:10}}>Detail:</span> 
            </div>

            <div className="" style={{margin: '0px 20px'}}>
                <span className="op-detail">{details[0] || ""}</span>
                <div style={{height: '100%', overflow:"scroll"}}>
                                <img
                                    alt="" 
                                    src={require('../static/op_detail_graph.png')}
                                    style={{width:'100%', objectFit:'overflow'}} 
                                />
                </div>
            </div>

            <div className="separator"></div>

            <div className="" style={{margin: '0px 20px'}}>
                <span className="op-detail">{details[1] || ""}</span>
                <div style={{height: '100%', overflow:"scroll"}}>
                                <img
                                    alt="" 
                                    src={require('../static/op_detail_graph.png')}
                                    style={{width:'100%', objectFit:'overflow'}} 
                                />
                </div>
            </div>

            <div className="separator"></div>

            <div className="" style={{margin: '0px 20px'}}>
                <span className="op-detail">{details[2] || ""}</span>
                <div style={{height: '100%', overflow:"scroll"}}>
                                <img
                                    alt="" 
                                    src={require('../static/op_detail_graph.png')}
                                    style={{width:'100%', objectFit:'overflow'}} 
                                />
                </div>
            </div>
        </div>
    )
}

export default OPDetail;
