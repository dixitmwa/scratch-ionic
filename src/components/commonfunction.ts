import validate from 'scratch-parser';
import { SB1File, ValidationError } from 'scratch-sb1-converter';

export async function loadProject(vm: any, input: any): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // Step 0: Convert non-buffer object to JSON string
      if (typeof input === 'object' && !(input instanceof ArrayBuffer) && !ArrayBuffer.isView(input)) {
        input = JSON.stringify(input);
      }
    } catch (e) {
      reject(e);
      return;
    }

    // Validate with scratch-parser (assumes version 2 project)
    validate(input, false, async (validationError: any, validatedProject: any) => {
      if (validationError) {
        // Could be SB1 (scratch 1 project) - try to parse with sb1 converter
        try {
          const sb1 = new SB1File(input);
          const jsonProject = sb1.json;
          jsonProject.projectVersion = 2; // force projectVersion to 2
          // Proceed deserialization with converted project JSON and ZIP data
          await vm.deserializeProject(jsonProject, sb1.zip);
          vm.runtime.handleProjectLoaded();
          resolve();
        } catch (sb1Error) {
          if (sb1Error instanceof ValidationError) {
            reject(JSON.stringify(validationError)); // validation error from scratch-parser
          } else {
            reject(sb1Error); // other error in SB1 conversion
          }
        }
      } else {
        // Input is a valid Scratch 2/3 project JSON
        debugger
        try {
          await vm.deserializeProject(validatedProject[0], validatedProject[1]);
          vm.runtime.handleProjectLoaded();
          resolve();
        } catch (deserializeError) {
          reject(deserializeError);
        }
      }
    });
  });
}
let projectFileUrl: any = null;
let lastSavedProject:any = null;
export async function getProjectFile() {
    console.log("Setting last saved project datasdfsf", projectFileUrl);
  return projectFileUrl;
}

export async function setProjectFile(file: any) {
    console.log("Setting last saved project data", file);
  projectFileUrl = file;
}

export async function getLastSavedProjectData() {
  return lastSavedProject;
}

export async function setLastSavedProjectData(data: any) {
  console.log("Setting last saved project data", data);
  return lastSavedProject = await data;
}