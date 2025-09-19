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
      console.log("🚀 loadProject - Starting with input type:", typeof input, "length:", input?.length);

      // Step 0: Convert non-buffer object to JSON string
      if (typeof input === 'object' && !(input instanceof ArrayBuffer) && !ArrayBuffer.isView(input)) {
        console.log("📝 loadProject - Converting object to JSON string");
        input = JSON.stringify(input);
      }
    } catch (e) {
      console.error("❌ loadProject - Error in initial conversion:", e);
      reject(e);
      return;
    }

    console.log("🔍 loadProject - Starting validation with scratch-parser");

    // Validate with scratch-parser (assumes version 2 project)
    validate(input, false, async (validationError: any, validatedProject: any) => {

      if (validationError) {
        console.log("⚠️ loadProject - Validation failed, trying SB1 converter");
        console.log("📄 Validation error details:", JSON.stringify(validationError, null, 2));

        // Could be SB1 (scratch 1 project) - try to parse with sb1 converter
        try {
          const sb1 = new SB1File(input);
          const jsonProject = sb1.json;
          console.log("✅ loadProject - SB1 conversion successful");
          jsonProject.projectVersion = 2;
          // Proceed deserialization with converted project JSON and ZIP data
          await vm.deserializeProject(jsonProject, sb1.zip);
          await vm.runtime.handleProjectLoaded();
          resolve();
        } catch (sb1Error: any) {
          console.error("❌ loadProject - SB1 conversion failed:", sb1Error);
          if (sb1Error instanceof ValidationError) {
            reject(new Error(`Validation failed: ${JSON.stringify(validationError)}`));
          } else {
            reject(sb1Error); // other error in SB1 conversion
          }
        }
      } else {
        // Input is a valid Scratch 2/3 project JSON
        console.log("✅ loadProject - Project validation successful, proceeding with deserialization");

        try {
          const projectJSON = validatedProject[0];
          const zip = validatedProject[1];

          console.log("📄 loadProject - Project JSON targets count:", projectJSON?.targets?.length);
          console.log("📦 loadProject - ZIP files count:", zip ? Object.keys(zip.files).length : 0);
debugger
          // Ensure all targets are valid and have required properties
          if (projectJSON && Array.isArray(projectJSON.targets)) {
            projectJSON.targets = projectJSON.targets.filter(t => !!t && typeof t === 'object');
            for (const target of projectJSON.targets) {
              if (!target.variables) target.variables = {};
              if (!target.lists) target.lists = {};
              if (!target.broadcasts) target.broadcasts = {};
              if (!target.blocks) target.blocks = {};
              if (!target.comments) target.comments = {};
              if (!target.costumes) target.costumes = [];
              if (!target.sounds) target.sounds = [];
              if (!target.data) target.data = {};
              // Add any other required properties here
            }
          }
          if (zip && !zip.file('cd21514d0531fdffb22204e0ec5ed84a.svg')) {
            console.log("🔧 loadProject - Adding missing SVG file");
            // Use the actual SVG content provided
            const svgContent = `<svg version="1.1" width="2" height="2" viewBox="-1 -1 2 2" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <!-- Exported by Scratch - http://scratch.mit.edu/ -->
</svg>`;
            zip.file('cd21514d0531fdffb22204e0ec5ed84a.svg', svgContent);
          }

          console.log("🚀 loadProject - Starting vm.deserializeProject");
          await vm.deserializeProject(projectJSON, zip);
          console.log("✅ loadProject - Deserialization complete");

          console.log("🚀 loadProject - Handling project loaded");
          await vm.runtime.handleProjectLoaded();
          console.log("✅ loadProject - Project loaded successfully");

          resolve();
        } catch (deserializeError: any) {
          console.error("❌ loadProject - Deserialization error:", deserializeError);
          console.error("❌ loadProject - Error details:", {
            message: deserializeError.message,
            stack: deserializeError.stack,
            name: deserializeError.name
          });
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