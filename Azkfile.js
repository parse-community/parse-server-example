/**
 * Documentation: http://docs.azk.io/Azkfile.js
 */
// Adds the systems that shape your system
systems({
  'parse-server': {
    // Dependent systems
    depends: ['mongodb'],
    // More images:  http://images.azk.io
    image: {"docker": "azukiapp/node"},
    // Steps to execute before running instances
    provision: [
      "cp .env.sample .env",
      "npm install"
    ],
    workdir: "/azk/#{manifest.dir}",
    shell: "/bin/bash",
    command: ["npm", "start"],
    wait: 120,
    mounts: {
      '/azk/#{manifest.dir}': sync("."),
      '/azk/#{manifest.dir}/node_modules': persistent("./node_modules"),
    },
    scalable: {"default": 1},
    http: {
      domains: [ "#{system.name}.#{azk.default_domain}" ]
    },
    ports: {
      // exports global variables
      http: "3000/tcp",
    },
    envs: {
      NODE_ENV: "dev",
      PORT: "3000",
      // DOMAIN will be passed to ParseServer
      DOMAIN: "#{system.name}.#{azk.default_domain}",
    },
  },

  'mongodb': {
    image : { docker: 'azukiapp/mongodb' },
    scalable: false,
    wait: 120,
    mounts: {
      '/data/db': persistent('mongodb-#{manifest.dir}'),
    },
    ports: {
      http: '28017:28017/tcp',
    },
    http: {
      domains: [ '#{manifest.dir}-#{system.name}.#{azk.default_domain}' ],
    },
    export_envs: {
      DATABASE_URI: 'mongodb://#{net.host}:#{net.port[27017]}/#{manifest.dir}_development',
    },
  },
});

setDefault('parse-server');
