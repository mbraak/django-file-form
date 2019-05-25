const gulp = require("gulp");
const babel = require("gulp-babel");
const uglify = require("gulp-uglify");

gulp.task(
  "default", () => (
    gulp.src("file_form.js")
      .pipe(babel())
      .pipe(uglify())
      .pipe(gulp.dest("../django_file_form/static/file_form/"))
  )
);

gulp.task(
  "watch",
  gulp.series(
    "default",
    done => {
      gulp.watch(
        "./*.js",
        gulp.series("default")
      );
      done();
    }
  )
);
