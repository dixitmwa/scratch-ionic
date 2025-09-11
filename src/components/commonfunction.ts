import validate from 'scratch-parser';
import { SB1File, ValidationError } from 'scratch-sb1-converter';

function cleanMissingCostumes(projectJson: any, zip: any) {
  for (const target of projectJson.targets) {
    if (target.costumes) {
      target.costumes = target.costumes.filter((c: any) => {
        const asset = zip.file(c.md5ext);
        return !!asset; // keep only if asset exists
      });
    }
  }
}


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
          debugger
          jsonProject.projectVersion = 2;
          // Proceed deserialization with converted project JSON and ZIP data
          await vm.deserializeProject(jsonProject, sb1.zip);
          await vm.runtime.handleProjectLoaded();
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
          const zip = validatedProject[1];
          if (zip && !zip.file('cd21514d0531fdffb22204e0ec5ed84a.svg')) {
            // Use the actual SVG content provided
            const svgContent = `<svg version="1.1" width="2" height="2" viewBox="-1 -1 2 2" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <!-- Exported by Scratch - http://scratch.mit.edu/ -->
</svg>`;
            zip.file('cd21514d0531fdffb22204e0ec5ed84a.svg', svgContent);
          }
          // await cleanMissingCostumes(validatedProject[0], validatedProject[1]);
          await vm.deserializeProject(validatedProject[0], validatedProject[1]);
          await vm.runtime.handleProjectLoaded();
          resolve();
        } catch (deserializeError) {
          reject(deserializeError);
        }
      }
    });
  });
}
let projectFileUrl: any = null;
let lastSavedProject: any = null;
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

/**
 * Deserialize a Scratch project (version 2 or 3) and install its targets.
 * @param vm - The Scratch VM instance (must have .runtime and .installTargets).
 * @param projectJSON - The project JSON object.
 * @param zip - Optional ZIP data for SB2 projects.
 * @returns Promise<void>
 */
// export async function deserializeProject(vm: any, projectJSON: any, zip?: any): Promise<void> {
//   // Clear the current runtime
//   if (typeof vm.clear === 'function') {
//     vm.clear();
//   }

//   if (typeof performance !== 'undefined') {
//     performance.mark('scratch-vm-deserialize-start');
//   }

//   const runtime = vm.runtime;
//   const projectVersion = projectJSON.projectVersion;

//   let targets, extensions;
//   if (projectVersion === 2) {
//     // SB2 deserialization
//     // Use ES module import for React/Ionic compatibility
//     const { deserialize: sb2Deserialize } = await import('./serialization/sb2');
//     ({ targets, extensions } = await sb2Deserialize(projectJSON, runtime, false, zip));
//   } else if (projectVersion === 3) {
//     // SB3 deserialization
//     const { deserialize: sb3Deserialize } = await import('./serialization/sb3-deserialize.js');
//     ({ targets, extensions } = await sb3Deserialize(projectJSON, runtime, zip));
//   } else {
//     // Unknown version
//     return Promise.reject('Unable to verify Scratch Project version.');
//   }

//   if (typeof performance !== 'undefined') {
//     performance.mark('scratch-vm-deserialize-end');
//     performance.measure('scratch-vm-deserialize',
//       'scratch-vm-deserialize-start', 'scratch-vm-deserialize-end');
//   }

//   // Install targets and extensions
//   await vm.installTargets(targets, extensions, true);
// }