const express = require('express')
const router = express.Router()

//----------------------------------------------------------------//
// /
router.get('/', (req, res, next) => {
  return res.status(200).json({
    suites: [
      {
        label: 'SSL Checks',
        children: [
          {
            label: 'Security Headers',
            name: 'securityheaders'
          },
          {
            label: 'SSL Labs',
            name: 'ssllabs'
          },
          {
            label: 'Hardenize',
            name: 'hardenize'
          }
        ]
      },
      {
        label: 'SEO & Accessibility Checks',
        children: [
          {
            label: 'Seobility',
            name: 'seobility'
          },
          {
            label: 'Varvy',
            name: 'varvy-seo'
          },
          {
            label: 'AChecker',
            name: 'achecker'
          }
        ]
      },
      {
        label: 'Performance Checks',
        children: [
          {
            label: 'Lighthouse',
            name: 'lighthouse'
          },
          {
            label: 'Webhint',
            name: 'webhint'
          },
          {
            label: 'Gtmetrix',
            name: 'gtmetrix'
          }
        ]
      },
      {
        label: 'Other Checks',
        children: [
          {
            label: 'W3 Markup Validator',
            name: 'w-three'
          },
          // {
          //   label: 'W3 CSS Validator',
          //   name: 'w-three-css'
          // },
          {
            label: 'Favicon Checker',
            name: 'favicon-checker'
          }
        ]
      }
    ]
  })
})

module.exports = router
