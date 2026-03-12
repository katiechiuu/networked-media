// beginning basic requirements
const express = require('express')
const multer = require('multer')

const app = express();

// creating slime filter tags
const types = ['cloud', 'butter', 'crunchy', 'floam', 'clear', 'glitter', 'glossy', 'other'];
const upload = multer({dest: 'public/uploads/'});

app.use(express.static('public'));
// reading form fields from request.body 
app.use(express.urlencoded({extended: true}));
app.set('view engine', 'ejs');

let recipes = [

];

// so that i can show the 3 most recent recipes on the home page
app.get('/', (request, response) => {
    let recent = [];
    for (let i = recipes.length - 1; i >= 0 && recent.length < 3; i--) {
        recent.push(recipes[i]);
    }
    response.render('index.ejs', {recentRecipes: recent});
});

app.get('/vault', (request, response) => {
  const type = request.query.type;
  let filtered = recipes;
  if (type) {
    // if filter exists, keep only matching recipe types
    filtered = recipes.filter(function(recipe) {
      return recipe.type === type;
    });
  };

response.render('vault.ejs', {
    recipes: filtered,
    activeFilter: type || null,
    types
    });
});

app.get('/submit', (request,response) => {
    response.render('submit.ejs', {types});
});

app.post('/submit', upload.single('recipeImage'), (request, response) => {
    let imageName = null;
    if (request.file) {
        imageName = request.file.filename;
    }
    
    const recipe = {
        name: request.body.recipeName,
        submitter: request.body.submitterName || 'anonymous',
        grade: request.body.grade || null,
        type: request.body.slimeType || 'other',
        ingredients: request.body.ingredients,
        instructions: request.body.instructions,
        image: imageName
    };

    // adding recipes to the array, then sending to vault page
    recipes.push(recipe);
    response.redirect('/vault');
});

app.get('/about', (request,response) => {
    response.render('about.ejs');
});

app.listen(6001, () => {
	console.log('server started on port 6001');
});
