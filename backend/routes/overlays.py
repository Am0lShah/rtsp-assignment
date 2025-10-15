from flask import Blueprint, request, jsonify
from datetime import datetime
import os
import uuid

try:
    from pymongo import MongoClient
    from pymongo.errors import ServerSelectionTimeoutError
    PYMONGO_AVAILABLE = True
except ImportError:
    PYMONGO_AVAILABLE = False
    print("⚠️  PyMongo not available, using in-memory storage")

overlays_bp = Blueprint('overlays', __name__)

# MongoDB connection with fallback
if PYMONGO_AVAILABLE:
    try:
        # Load environment variables
        from dotenv import load_dotenv
        load_dotenv()
        
        mongo_uri = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/rtsp_overlays')
        print(f"🔗 Connecting to MongoDB: {mongo_uri}")
        
        client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
        # Test connection
        client.server_info()
        
        # Get database from URI or use default
        if '/rtsp_overlays' in mongo_uri:
            db = client.rtsp_overlays
        else:
            db = client.get_default_database()
            
        collection = db.overlays
        print("✅ Connected to MongoDB successfully!")
        print(f"📊 Database: {db.name}, Collection: {collection.name}")
    except Exception as e:
        print(f"⚠️  MongoDB connection failed: {e}")
        print("📝 Using in-memory storage (data will not persist)")
        collection = []
else:
    print("📝 Using in-memory storage (data will not persist)")
    collection = []

@overlays_bp.route('', methods=['POST'])
def create_overlay():
    """Create a new overlay"""
    try:
        payload = request.get_json()
        
        # Add timestamp
        payload['createdAt'] = datetime.utcnow().isoformat()
        payload['updatedAt'] = datetime.utcnow().isoformat()
        
        # Set defaults if not provided
        if 'zIndex' not in payload:
            payload['zIndex'] = 10
        if 'position' not in payload:
            payload['position'] = {'x': 10, 'y': 10}
        if 'size' not in payload:
            payload['size'] = {'width': 100, 'height': 30}
        
        if isinstance(collection, list):
            # In-memory storage
            import uuid
            payload['_id'] = str(uuid.uuid4())
            collection.append(payload)
            return jsonify({'_id': payload['_id'], 'success': True}), 201
        else:
            # MongoDB storage
            result = collection.insert_one(payload)
            return jsonify({'_id': str(result.inserted_id), 'success': True}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@overlays_bp.route('', methods=['GET'])
def list_overlays():
    """Get all overlays"""
    try:
        if isinstance(collection, list):
            # In-memory storage
            return jsonify(collection)
        else:
            # MongoDB storage
            overlays = []
            for overlay in collection.find():
                overlay['_id'] = str(overlay['_id'])
                overlays.append(overlay)
            return jsonify(overlays)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@overlays_bp.route('/<overlay_id>', methods=['GET'])
def get_overlay(overlay_id):
    """Get a specific overlay"""
    try:
        if isinstance(collection, list):
            # In-memory storage
            for overlay in collection:
                if overlay['_id'] == overlay_id:
                    return jsonify(overlay)
            return jsonify({'error': 'Overlay not found'}), 404
        else:
            # MongoDB storage
            from bson.objectid import ObjectId
            overlay = collection.find_one({'_id': ObjectId(overlay_id)})
            if overlay:
                overlay['_id'] = str(overlay['_id'])
                return jsonify(overlay)
            return jsonify({'error': 'Overlay not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@overlays_bp.route('/<overlay_id>', methods=['PUT'])
def update_overlay(overlay_id):
    """Update an overlay"""
    try:
        payload = request.get_json()
        payload['updatedAt'] = datetime.utcnow().isoformat()
        
        if isinstance(collection, list):
            # In-memory storage
            for i, overlay in enumerate(collection):
                if overlay['_id'] == overlay_id:
                    collection[i].update(payload)
                    return jsonify({'updated': True, 'success': True})
            return jsonify({'error': 'Overlay not found'}), 404
        else:
            # MongoDB storage
            from bson.objectid import ObjectId
            result = collection.update_one(
                {'_id': ObjectId(overlay_id)}, 
                {'$set': payload}
            )
            
            if result.matched_count:
                return jsonify({'updated': True, 'success': True})
            return jsonify({'error': 'Overlay not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@overlays_bp.route('/<overlay_id>', methods=['DELETE'])
def delete_overlay(overlay_id):
    """Delete an overlay"""
    try:
        if isinstance(collection, list):
            # In-memory storage
            for i, overlay in enumerate(collection):
                if overlay['_id'] == overlay_id:
                    collection.pop(i)
                    return jsonify({'deleted': True, 'success': True})
            return jsonify({'error': 'Overlay not found'}), 404
        else:
            # MongoDB storage
            from bson.objectid import ObjectId
            result = collection.delete_one({'_id': ObjectId(overlay_id)})
            if result.deleted_count:
                return jsonify({'deleted': True, 'success': True})
            return jsonify({'error': 'Overlay not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 400