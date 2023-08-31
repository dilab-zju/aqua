from flask import Flask, request, session
from flask_restful import Resource, Api
from flask_cors import CORS
from src.parser import parse_function, parse_op_graph
from src.model import ModelLoader
from src.nudf import nUDFProcessor
from src.db_retriever import DBRetriever
from datetime import date

app = Flask(__name__)
CORS(app, supports_credentials=True)
api = Api(app)


class ModelUpload(Resource):
	def get(self):
		return {'msg':'get'}, 200
	def post(self):
		return {'msg':'get'}, 200
		

class NUDFCreate(Resource):
	def get(self):
		return {'msg':'get'}, 200
	def post(self):
		return {'msg':'get'}, 200


class NUDFGet(Resource):
	def get(self):
		return {'msg':'ok'}, 200
	def post(self):
		return {'msg':'get'}, 200
	

class GetMGraphData(Resource):
	def get(self):
		return {'msg':'get'}, 200
	def post(self):
		return {'msg': 'ok'}, 200


class GetTableSchema(Resource):
	def get(self):
		return {'msg':'get'}, 200


class GetSampleData(Resource):
	def get(self):
		return {'msg':'get'}, 200


class InitOP(Resource):
	def get(self):
		return {'msg':'get'}, 200

	def post(self):
		return {'msg':'get'}, 200


class StartOP(Resource):
	def get(self):
		return {'msg':'get'}, 200
	def post(self):
		return {'msg':'get'}, 200


class GetOPDetail(Resource):
	def get(self):
		return {'msg':'get'}, 200
	def post(self):
		return {'msg': 'ok'}, 200


class ExecuteQuery(Resource):
	def get(self):
		return {'msg':'get'}, 200
	def post(self):
		return {'msg':'ok'}, 200
	

class ExplainQuery(Resource):
	def get(self):
		return {'msg':'get'}, 200
	def post(self):
		return {'msg':'ok'}, 200
		
# Create Module
api.add_resource(NUDFCreate, "/api/create_nudf")
api.add_resource(ModelUpload, "/api/model_upload")
api.add_resource(NUDFGet, "/api/nudf_get")
api.add_resource(GetMGraphData, "/api/get_mgraph_data")
api.add_resource(GetTableSchema, "/api/get_table_schema")
api.add_resource(GetSampleData, "/api/get_sample_data")

# Optimize Module
api.add_resource(InitOP, "/api/init_op")
api.add_resource(StartOP, "/api/start_optimization")
api.add_resource(GetOPDetail, "/api/get_op_detail")

# Query Module
api.add_resource(ExecuteQuery, "/api/execute_query")
api.add_resource(ExplainQuery, "/api/explain_query")

if __name__ == '__main__':
	global _model_parsers, _nudfs, _op_details, _db_tables
	global _db_retriever
	_model_pools = {}
	_nudfs = {}
	_op_details = {}
	_db_tables = {}
	_db_retriever = DBRetriever()
	

	app.run(host='0.0.0.0', port=5050, debug=True)
 