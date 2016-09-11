module.exports = function (grunt) {

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-text-replace');
    grunt.loadNpmTasks('grunt-express');
    grunt.loadNpmTasks('grunt-open');


    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        
        copy: {
            fonts: {  src: 'fonts/*', dest:'server/' },
            images: {src:  'images/*', dest: 'server/'},
            maps: {src: 'maps/*', dest:'server/'},
            lib: { src: 'lib/*', dest: 'server/' }
        }, 
        replace: {
            gamePath: {
                src: 'index.html',            
                dest: 'server/index.html', 
                replacements: [ { 
                    from: '<script src="js/TankMenus.js"></script>',
                    to: '' 
                },
                { 
                    from: '<script src="js/Entities.js"></script>',
                    to: '' 
                },
                {
                    from: 'js/TankGame.js',
                    to: 'lib/TankGame.min.js'
                }
                ]
            }
        },
        jshint: {
            src: 'js/*.js'    
        },
        
        uglify: {
            options: {
                beautify: false,
                mangle: true
            },
            server: {
                src: 'js/*.js',
                dest: 'server/lib/<%= pkg.name %>.min.js'
            }
        },

        express: {
            site: {
                options: {
                    port: 9000,
                    bases: 'server'
                }
            }
        },
        open: {
            site: {
                path: 'http://localhost:9000/index.html'
            }
        }

    });


    // Default task(s).
    grunt.registerTask('default', ['jshint', 'uglify', 'replace:gamePath', 'copy', 'express', 'open', 'express-keepalive']);
};