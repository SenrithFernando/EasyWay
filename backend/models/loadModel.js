import { createRequire } from 'module';
import mongoose from 'mongoose';

const require = createRequire(import.meta.url);

const loadModel = (modelName, candidatePaths = []) => {
  if (mongoose.models[modelName]) {
    return mongoose.models[modelName];
  }

  for (const candidatePath of candidatePaths) {
    try {
      const loadedModule = require(candidatePath);
      return loadedModule.default || loadedModule;
    } catch (error) {
      if (error.code !== 'MODULE_NOT_FOUND') {
        throw error;
      }
    }
  }

  throw new Error(
    `${modelName} model could not be resolved. Register it with Mongoose before using the feedback module, or update the candidate paths in loadModel().`
  );
};

export default loadModel;
