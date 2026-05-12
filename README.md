# starwing-lms

## Task
The task is to identify and fix the following bugs introduced in the project:
* [ ] Status filtering doesn’t work in the catalog API
* [ ] Pagination skips the final page of courses
* [ ] Newly created courses lack a valid `createdAt` timestamp
* [ ] Deleting a course doesn’t persist after a server restart
* [x] Pagination bounds behave erratically with small or large page sizes
* [ ] Clicking catalog actions throws `preventDefault` errors
* [ ] Changing the category filter updates the wrong field
* [ ] Text search returns unfiltered results
* [ ] “Next” pagination button does not advance
* [ ] Course detail modal hides edit/delete options after signing in

## Notes
These issues impact core functionality including API reliability, UI behavior, and data persistence.
All fixes should be thoroughly tested before submission.
