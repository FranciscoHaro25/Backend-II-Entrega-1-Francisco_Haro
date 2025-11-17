const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const User = require("../models/User");
const bcrypt = require("bcrypt");

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

passport.use(
  "local-login",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
    },
    async (req, email, password, done) => {
      try {
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
          return done(null, false, {
            message: "Email o contraseña incorrectos",
          });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
          return done(null, false, {
            message: "Email o contraseña incorrectos",
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.use(
  "local-register",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
    },
    async (req, email, password, done) => {
      try {
        const existingUser = await User.findOne({ email: email.toLowerCase() });

        if (existingUser) {
          return done(null, false, {
            message: "Este email ya está registrado",
          });
        }

        const { first_name, last_name, age } = req.body;

        if (!first_name || !last_name || !age) {
          return done(null, false, {
            message: "Todos los campos son obligatorios",
          });
        }

        const saltRounds = 10;
        const hashedPassword = bcrypt.hashSync(password, saltRounds);

        const newUser = new User({
          first_name: first_name.trim(),
          last_name: last_name.trim(),
          email: email.toLowerCase().trim(),
          password: hashedPassword,
          age: parseInt(age),
          role: "user",
        });

        const savedUser = await newUser.save();
        return done(null, savedUser);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ githubId: profile.id });

        if (user) {
          user.lastLogin = new Date();
          await user.save();
          return done(null, user);
        }

        if (profile.emails && profile.emails.length > 0) {
          const email = profile.emails[0].value;
          user = await User.findOne({ email: email.toLowerCase() });

          if (user) {
            user.githubId = profile.id;
            user.githubUsername = profile.username;
            user.lastLogin = new Date();
            await user.save();
            return done(null, user);
          }
        }

        const githubData = profile._json || {};
        let first_name, last_name;

        if (githubData.name && githubData.name.trim()) {
          const nameParts = githubData.name.trim().split(" ");
          first_name = nameParts[0];
          last_name = nameParts.slice(1).join(" ") || githubData.login;
        } else if (profile.displayName && profile.displayName.trim()) {
          const nameParts = profile.displayName.trim().split(" ");
          first_name = nameParts[0];
          last_name = nameParts.slice(1).join(" ") || githubData.login;
        } else if (profile.name && profile.name.trim()) {
          const nameParts = profile.name.trim().split(" ");
          first_name = nameParts[0];
          last_name = nameParts.slice(1).join(" ") || githubData.login;
        } else {
          const username = githubData.login || profile.username;
          const nameParts = username.split(/[0-9_-]/);
          first_name = nameParts[0] || username;
          last_name = nameParts[1] || "User";
        }

        let email;
        if (profile.emails && profile.emails.length > 0) {
          email = profile.emails[0].value.toLowerCase();
        } else if (githubData.email && githubData.email.trim()) {
          email = githubData.email.toLowerCase();
        } else {
          const username = githubData.login || profile.username;
          email = `${username.toLowerCase()}@users.noreply.github.com`;
        }

        const newUser = new User({
          githubId: githubData.id || profile.id,
          githubUsername: githubData.login || profile.username,
          first_name,
          last_name,
          email,
          age: 25,
          role: "user",
          password: "oauth_github",
          isActive: true,
          lastLogin: new Date(),
          githubProfile: {
            avatar_url: githubData.avatar_url,
            html_url: githubData.html_url,
            company: githubData.company,
            location: githubData.location,
            bio: githubData.bio,
            public_repos: githubData.public_repos,
            followers: githubData.followers,
            following: githubData.following,
            created_at: githubData.created_at,
          },
        });

        const savedUser = await newUser.save();
        return done(null, savedUser);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.use(
  "jwt",
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => {
          let token = null;
          if (req && req.signedCookies) {
            token = req.signedCookies["currentUser"];
          }
          return token;
        },
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      secretOrKey: process.env.JWT_SECRET,
    },
    async (jwtPayload, done) => {
      try {
        const user = await User.findById(jwtPayload.id).select("-password");

        if (user) {
          return done(null, user);
        } else {
          return done(null, false);
        }
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

module.exports = passport;
