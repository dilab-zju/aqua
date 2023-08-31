import { addDBTABLE } from '../actions';
import {connect} from 'react-redux'

import {Input, Select, Button, message} from 'antd'
const CTableCreate = ({confirmCTable}) => {

    const tableType = [{value:'Integer', label:'Integer'}, {value:'Double', label:'Double'}, {value:'Date', label:'Date'}, {value:'Virtual', label:'Virtual'}]

    const handleCreateCTable = () => {
        let ctableName = document.getElementById("ctable_name").value
        if (ctableName === "") {
            message.error("[CTable] empty value!")
            return
        }
        confirmCTable([ctableName])
    }

    return (
        <div className="module-border" style={{ height: "100%", width: "98%", marginLeft: "2%" }}
        >
            <div className="module-title" style={{ height: "10%", display: "flex", alignItems: "center" }}>
                <span style={{ marginLeft: 5 }}>Create Collaborative Table</span>
            </div>
            <div
                className="module-content"
                style={{
                margin: "8px 20px",
                height: "8%",
                display: "flex",
                alignItems: "center",
                }}
            >
                <span style={{ width: "35%" }}>Table Name:</span>
                <Input
                id="ctable_name"
                style={{ width: "40%", height: "90%" }}
                placeholder=""
                />
            </div>
            <div
                className="module-content"
                style={{
                margin: "5px 20px",
                height: "8%",
                display: "flex",
                alignItems: "center",
                }}
            >
                <span style={{ width: "35%" }}>Columns:</span>
            </div>
            <div
                className="module-content"
                style={{
                margin: "5px 20px",
                height: "10%",
                display: "flex",
                alignItems: "center",
                }}
            >
                <Input
                style={{ width: "35%", height: "90%", marginRight: "5%" }}
                />
                <Select
                style={{ width: "40%", height: "90" }}
                options={tableType}
                />
            </div>
            <div
                className="module-content"
                style={{
                margin: "5px 20px",
                height: "10%",
                display: "flex",
                alignItems: "center",
                }}
            >
                <Input
                style={{ width: "35%", height: "90%", marginRight: "5%" }}
                />
                <Select
                
                style={{ width: "40%", height: "90" }}
                options={tableType}
                />
            </div>
            <div
                className="module-content"
                style={{
                margin: "5px 20px",
                height: "10%",
                display: "flex",
                alignItems: "center",
                }}
            >
                <Input
                style={{ width: "35%", height: "90%", marginRight: "5%" }}
                />
                <Select
                style={{ width: "40%", height: "90" }}
                options={tableType}
                />
            </div>
            <div
                className="module-content"
                style={{
                marginTop: "5px",
                marginLeft: "20px",
                height: "10%",
                display: "flex",
                alignItems: "center",
                }}
            >
                <span style={{ width: "25%" }}>Data Type:</span>
                <Input
                style={{ width: "25%", height: "90%" }}
                placeholder=""
                />
                
            </div>
            <Button
                className="module-button"
                onClick={handleCreateCTable}
                style={{ float: "right", height: "28px", marginTop: "1%" }}
            >
                Confirm
            </Button>
        </div>
    );
};

const mapStateToProps = state => {
    return {
      dbTable: state.dbTable
    }
}

const mapDispatchToProps = dispatch => {
    return {
      confirmCTable: (newTableName) => {
        dispatch(addDBTABLE(newTableName))
      }
    }
  }

  export default connect(mapStateToProps, mapDispatchToProps)(CTableCreate);
