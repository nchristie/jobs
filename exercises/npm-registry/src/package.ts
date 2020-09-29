import { RequestHandler } from 'express';
import got from 'got';
import { NPMPackage } from './types';

/**
 * Attempts to retrieve package data from the npm registry and return it
 */
export const getPackage: RequestHandler = async function (req, res, next) {
  const { name, version } = req.params;

  try {
    let dependencies = await getDependencies(name, version);
    return res.status(200).json({ name, version, dependencies });
  } catch (error) {
    return next(error);
  }
};

async function getDependencies(name, version) {
  
  const npmPackage: NPMPackage = await got(
    `https://registry.npmjs.org/${name}`,
  ).json();

  const return_dependencies = {}
  try {
    const dependencies = npmPackage.versions[version].dependencies;
    for (const dependency_name in dependencies) {
      const version_regex = /[0-9]{1,}.[0-9]{1,}.[0-9]{1,}/g;
      let dependency_version = version_regex.exec(dependencies[dependency_name]);
      return_dependencies[dependency_name] = {
        version: dependency_version,
        dependencies: await getDependencies(dependency_name, dependency_version)
      };
    }
  }

  catch(error) {
    console.log(name, "error:", error);
  }

  return return_dependencies;
}


