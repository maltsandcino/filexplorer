const passport = require('passport');
const { PrismaClient } = require('../generated/prisma')
const prisma = new PrismaClient()
const bcrypt = require('bcryptjs');
const supabase = require('../supabase');
const {v4: uuidv4 } = require('uuid');

// Render Link

exports.setLink = async (req, res) => {
  if (!req.user){
    return res.redirect("/");
  }
  const folderId = parseInt(req.params.folderid);
  const folder = await prisma.folder.findUnique({where: {
    id: folderId,
    userId: req.user.id
  }
  })

  const token = uuidv4();

  const newToken = await prisma.sharedFolderToken.create({
      data: {
        token: token,          
        folderId: folderId,
        expiresAt: new Date(Date.now() + 60*60*1000), // 1 hour expiry
      },
      select: {
        id: true,
        token: true,
        expiresAt: true
      }
    });
const base_url = process.env.BASE_URL;
return res.render("newshare", {user: req.user, folder: folder, token: newToken, base_url: base_url})
  }
// Logged out user path

exports.getLink = async (req, res) => {

  const token = await prisma.sharedFolderToken.findUnique({where: {
    token: req.params.token
  },
 include: {
    folder: {
      include: {
        user: true,
        contents: true
      }
    }
  }});

  const username = token.folder.user.username;

  const files = token.folder.contents;

  if (token.expiresAt < new Date()) {
    return res.render("files.ejs", {expired: true, username: username, files: null, folder: null, user: req.user })
  }

  return res.render("files.ejs", {expired: false, username: username, files: files, folder: token.folder , user: req.user})
}

// Render Home
exports.getHome = async (req, res) => {
        if (!req.user){
        res.render("index", { user: req.user, files: null, subfolders: null, folder: null});}
        else {
        // Avoid passing user password beyond this point.
        const safeUser = {
            id: req.user.id,
            username: req.user.username,
            email: req.user.email
          }
        // Get top level folder on first login.
        const folder = await prisma.folder.findFirst({where: {
          userId : req.user.id,
          parentId : null
          },
          select: {
            id: true,
            name: true,
            parentId: true,
            children: true,
            contents: true,
            parent: true
          }
        });
        // If there is a base Folder
        if (folder){
        const childFolders = folder.children;
        const files = folder.contents;
        res.render("index", { user: safeUser, folder: folder, files: files, subfolders: childFolders});
        }
        // If there is not a base folder, create one and render home.
        else {
          const newFolder = await prisma.folder.create({
            data: {
              userId: req.user.id,
              parentId: null,
              name: "Home",
              size: 0
            },
              select: {
                id: true,
                name: true,
                parentId: true,
                children: true,
                contents: true,
                parent: true
              }
          })
        res.render("index", { user: safeUser, folder: newFolder, files: null, subfolders: null});
        }

      }
}

// Login
exports.postLogin = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      req.flash('error', info.message); // flash the error message
      req.flash('username', req.body.username); // manually flash the attempted username
      return res.redirect('/');
    }

    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.redirect('/');
    });
  })(req, res, next);
};

// Logout route
exports.getLogout = (req, res) => {
    req.logOut(req.user, (err) => {
      if (err) return next(err);
      return res.redirect('/');
    });
}

exports.postSignup = async (req, res, next) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password.trim(), 10);
    const username = req.body.username.trim();
    const email = req.body.email.trim();

    if (!email || !username || !hashedPassword){
      req.flash('signuperror', "Please provide actual credentials.");
      return res.redirect('/');

    }

    const result = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        username
      },
      select: {
        id: true,
        email: true,
        username: true
      }
    });
    req.login(result, (err) => {
      if (err) return next(err);
      res.redirect('/');
    });

  } catch (error) {
    console.error(error);
    req.flash('signuperror', "Username or Email already in use.");
    res.redirect('/');
  }
};


exports.createFolder = async (req, res, next) => {
  // Create a folder route. This should probably redirect back to the current working directory (or allow for something Ajax-y)
  
    const name = req.body.foldername;
    const parentId = parseInt(req.body.parentId);
    console.log(req.user.id)
    const newFolder = await prisma.folder.create({
            data: {
              userId: req.user.id,
              parentId: parentId,
              name: name,
              size: 0
            }
          })
    res.redirect(`folder/${parentId}`);
}

exports.getFolder = async (req, res, next) => {

  // This route will basically render the index, with the folder provided by the user as the one we load.
  let currentFolder = req.params.folderid;

  currentFolder = parseInt(currentFolder, 10)
 

  const folder = await prisma.folder.findFirst({where: {
          userId : req.user.id,
          id : currentFolder
          },
          select: {
            id: true,
            name: true,
            parentId: true,
            children: true,
            contents: true,
            parent: true
          }
        });
        // If there is a base Folder
        if (folder){
        const childFolders = folder.children;
        const files = folder.contents;
        // Should make user slightly more safe here, but for now just do this.
        res.render("index", { user: req.user, folder: folder, files: files, subfolders: childFolders});
        }
        else{
          res.redirect("/");
        }

}

exports.uploadFile = async (req, res, next) => {
  // Create a folder route. This should probably redirect back to the current working directory (or allow for something Ajax-y)
  
    const name = req.body.filename;
    const folderId = parseInt(req.body.folderId);
    const file = req.file;

    if (!file) {
      return res.status(400).send("No File uploaded");
    }

    if (file.size > 500 * 1024){
      return res.status(400).send("File too large.")
    }
    try {
    // First, upload the file to Supabase.
    const {data, error } = await supabase.storage
    .from('Filexplore')
    .upload(`uploads/${Date.now()}-${file.originalname}`, file.buffer, {
      contentType: file.mimetype,
      upsert: true
    });

    if (error) {
      console.error(error);
      return res.status(500).send("Error uploading file");
    }
    // Get the file data (assuming this is successfully uploaded)
    const { data: urlData } = supabase.storage
    .from('Filexplore')
    .getPublicUrl(data.path);

    const publicURL = urlData.publicUrl;
    // Create the file

   
    const newfile = await prisma.file.create({
        data: {
          title: name,
          link: publicURL,
          userId: req.user.id,
          folderId: folderId,
          size: (file.size / 1024),
        },
        select: {
          title: true
        }
      })
 
    // Update the folder size
      await prisma.folder.update({
        where: { id: folderId },
        data: {
          size: {
            increment: Math.round(file.size / 1024) // add file size in KB
          }
        }
      });
    // Redirect back to the folder
      res.redirect(`folder/${folderId}`);
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error")
    }
  };
