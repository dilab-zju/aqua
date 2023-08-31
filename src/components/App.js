import './App.css'
import Create from './create.js'
import Optimize from './optimize.js'
import Query from './query.js'
import {
  GitlabFilled,
  DatabaseOutlined,
  BookOutlined,
  SearchOutlined
} from "@ant-design/icons";
import {Layout, Menu} from "antd";
import React, { useState } from "react";
import { rgb } from 'd3'
const { Header, Content, Sider } = Layout;


const App = () => {
  const [curPage, setPage] = useState(0)
  const showPage = () => {
    
    switch(curPage) {
      case 0:
        return <Create></Create>
      case 1:
        return <Optimize></Optimize>
      case 2:
        return <Query></Query>
      default:
        return <Create></Create>
    }
  }

  const clickMenu = (e)=> {
    let pageMap = new Map([
      ["create", 0],
      ["optimize", 1],
      ["query", 2],
    ])
    let oldStep = "step" + curPage.toString();
    let newPage = pageMap.get(e.key);
    setPage(newPage);
    let newStep = "step" + newPage.toString();
    
    document.getElementById(oldStep).classList.remove("step-circle-focus");
    document.getElementById(oldStep).classList.add("step-circle");
    document.getElementById(newStep).classList.remove("step-circle");
    document.getElementById(newStep).classList.add("step-circle-focus");
    
  }
  return (
    <Layout
      style={{
        minHeight: "100vh",
        height: "100vh"
      }}
    >
      <Header
        className="site-header"
        style={{
          height: 50,
          inlineHight:50,
          padding: 0,
          display:'flex',
          alignItems:'center'
        }}
      >
         <GitlabFilled style={{fontSize:'22px',paddingLeft:'20px',color:rgb(22,93,255,1)}}  />
         <div className="site-title" style={{height:"100%",margin:'auto 0',paddingLeft:'15px'}} >
          AQUA: Automatic Collaborative Query Processing in Analytical Database
          </div>
      </Header>

      <Layout hasSider="false">
        <Sider
          width={130}
          className="site-sider"
          style={{
            overflow: 'auto',
            minWidth: 50
          }}
        >
          <Menu
            theme="light"
            style={{width: 130}}
            mode="inline"
            defaultSelectedKeys={['create']}
            onClick={clickMenu}
          >
            <Menu.Item key="create">
              <DatabaseOutlined style={{fontSize: 17}}/>
              <span>Create</span>
            </Menu.Item>
            <Menu.Item key="optimize">
              <BookOutlined style={{fontSize: 17}}/>
              <span>Optimize</span>
            </Menu.Item>
            <Menu.Item key="query">
              <SearchOutlined style={{fontSize: 17}}/>
              <span>Query</span>
            </Menu.Item>
          </Menu>
        </Sider>
        <Content
          style={{
            margin: "0 0px",
          }}
        >
          <div
            style={{
              display:'flex',
              height:'100%'
            }}
          >
            <div className='content-main'
              style={{
                width: '100%',
                height: '100%'
              }}
            >
              <div className='content-main-top'
                style={{
                  width: '100%',
                  height: '4%',
                }}
              >
                <div style={{height:'100%', display:'flex', alignItems:'center'}}>
                  <span id="step0" className='step-circle-focus'> 1 </span>
                  <span className='step-content'> nUDF Creation  </span>

                  <span id="step1" className='step-circle'> 2 </span>
                  <span className='step-content'> Offline Query Optimization</span>

                  <span id="step2" className='step-circle'>3</span>
                  <span className='step-content'>Online Collaborative Query Processing</span>
                 
                </div>
              </div>
              <div className='content-main-component'
                style={{
                  width: '100%',
                  height: '95%'
                }}
              >
                {showPage()}
              </div>
            </div>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};
export default App;
