#!/bin/bash

# Script to systematically fix all TS6133 errors

echo "Fixing TS6133 errors..."

# Fix AddUnitTab destructuring
sed -i '' '51,53d' src/features/AddUnit/components/AddUnitTab.tsx
sed -i '' '50a\
  const {\
    addUnitMapRef,\
    addUnitMap,' src/features/AddUnit/components/AddUnitTab.tsx

# Fix AddUnitTab event handler
sed -i '' 's/onClick={(e) => {/onClick={(_e) => {/' src/features/AddUnit/components/AddUnitTab.tsx

# Fix unitHandlers
sed -i '' 's/const addedMarkers =/const _addedMarkers =/' src/features/AddUnit/handlers/unitHandlers.ts

# Fix loadGoogleApiFunc
sed -i '' 's/} catch (error) {/} catch (_error) {/' src/functions/loadGoogleApiFunc/index.ts

echo "Done!"
