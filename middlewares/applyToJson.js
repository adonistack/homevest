function applyToJSON(schema) {
    schema.set('toJSON', {
        transform(doc, ret) {
            const transformed = {};
            transformed._id = ret._id;

            Object.keys(schema.paths).forEach((path) => {
                if (path === '__v') return; 
                const pathType = schema.paths[path].instance;
                const schemaOptions = schema.paths[path].options;

                if (pathType === 'String'|| pathType === 'Number'|| pathType === 'Date'||  pathType === 'Boolean') {
                    transformed[path] = ret[path];
                } else if (schemaOptions.type)  {
                    transformed[path] = ret[path];
                } else if (pathType === 'Array' || Array.isArray(schemaOptions.type)){
                    transformed[path] = ret[path];
                } 
            });

            if (ret.createdAt) transformed.createdAt = ret.createdAt;
            if (ret.updatedAt) transformed.updatedAt = ret.updatedAt;

            return transformed;
        }
    });
}

module.exports = applyToJSON;
