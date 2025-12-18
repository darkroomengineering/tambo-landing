- Create aliases for the components imports in tsconfig.json
- Create a CVA to clsx utility function
- Create Tambo styles and scripts to add it to setup styles
- Migrate Tailwind to DR-* prefix with script

 Notes
 - startNewThread could be a Promise<string> so once it's resolved, we can store the new thread without reacting to threads array changes
 - Are resources working?
 - useTamboComponentState setter only accepts direct values, not callback functions