# Course Planner API

**A course planning service to schedule & manage your lessons.**

---

&nbsp;

## API features

&nbsp;

- **Create a lesson**
: create a new lesson with the desired pattern of recurrences; one-time event, daily, weekly.

- **Fetch your lessons**
: Fetch all the lessons you have scheduled. Including the start & expire date, recurrence pattern, & number of lessons left in that recurrence.

- **Update a lesson**
: Update your lesson, whether an individual event/recurrence or follow up with all the upcoming lessons ahead of it. You may reschedule, move it or delete it completely. As well as its title & description.

- **Delete a lesson**
: Whether a whole lesson course or a single recurrence, you may delete the specified event and optionally all the following events ahead of it as well.

&nbsp;

## Tech invloved

The API is created in Express.js (TypeScript), with connection to MySQL DB via [Prisma ORM](https://www.prisma.io/) to provide easier syntax reading & modification. \
JWT demo is installed as middleware for security.

---

&nbsp;

## API Routes

&nbsp;

`POST` - `/generateToken`

Generate temporary web tokens to access other requests.

`POST` - `/lesson/create`

```js
// Date format = UTC string "YYYY:MM:DDTHH:MM:SSZ"
json body: { 
  "title": lesson title, 
  "description": lesson description,
  "startDate": lesson start date,
  "recurrence": [ pattern ("sun"-"sat" || "all") ] // Optional
  "expDate": lesson expiration date // for recurrence
 }
```

Pass body with included properties to create a new lesson. Recurrence is optional with the following arguments: [**sun**, **mon**, **tue**, **wed**, **thu**, **fri**, **sat**, **all** (*for daily recurrence*)]

`GET` - `/lesson/fetch`

```js
json body: { 
  "user": user ID // number
 }
```

Fetch all the user's scheduled lessons with each of their recurrence patterns

`PUT` - `/lesson/update`

```js
json body: { 
  "lessonId": Lesson ID, // number

  "newTitle": New lesson title, // Optional
  "newDescription": New lesson description, // Optional

  /* Lesson rescheduling */
  "recurrenceId": specify exact recurrence pattern, // number
  "newDate": specify the rescheduled date,

  /* Properties for pattern lessons */
  "index": Index of the lesson in the pattern, // number
  "followUp": true | false - follow up lessons // Optional
 }
```

Update lesson's title, description, or reschedule it accordingly. whether it is a single event or a recurring one, you can pick the lesson & update it individually or all its following events in the pattern.

`DELETE` - `/lesson/delete`

```js
/* Delete whole lesson course */
json body: { 
  "lessonId": Lesson ID, // number
 }

/* Delete one of the lesson's recurrences */
json body: { 
  "recurrenceId": Recurrence ID, // number
  "index": Specify lesson index in the recurrence, // Optional
  "followUp": Delete following events as well // Optional
 }
```

Delete a whole lesson, whole recurrence or part of a recurrence.

&nbsp;

## Resolved issues

- [x] Exact time setting
- [ ] Each weekday is separate in recurrence - more db records & query complexity of O^2
- [ ] Error handling
- [x] Delete lesson when it has no recurrences
- [ ] Expried lessons will still appear in the fetch request
