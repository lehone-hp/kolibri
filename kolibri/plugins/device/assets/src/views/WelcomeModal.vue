<template>

  <KModal
    :title="$tr('welcomeModalHeader')"
    :submitText="coreString('continueAction')"
    @submit="$emit('submit')"
  >
    <p
      v-for="(paragraph, idx) in paragraphs"
      :key="idx"
      class="paragraph"
    >
      {{ paragraph }}
    </p>
  </KModal>

</template>


<script>

  import commonCoreStrings from 'kolibri.coreVue.mixins.commonCoreStrings';
  import plugin_data from 'plugin_data';

  export default {
    name: 'WelcomeModal',
    mixins: [commonCoreStrings],
    props: {
      importedFacility: {
        type: Object,
        default: null,
      },
      isLOD: {
        type: Boolean,
        default: plugin_data.isSubsetOfUsersDevice,
      },
    },
    computed: {
      paragraphs() {
        if (this.isLOD) {
          let facility = this.importedFacility;
          if (this.$store.getters.facilities.length > 0 && facility === null)
            facility = this.$store.getters.facilities[0];
          const sndParagraph =
            facility === null
              ? this.$tr('learnOnlyDeviceWelcomeMessage2')
              : this.$tr('postSyncWelcomeMessage2', { facilityName: facility.name });
          return [this.$tr('learnOnlyDeviceWelcomeMessage1'), sndParagraph];
        }
        if (this.importedFacility) {
          return [
            this.$tr('postSyncWelcomeMessage1'),
            this.$tr('postSyncWelcomeMessage2', { facilityName: this.importedFacility.name }),
          ];
        } else {
          return [
            this.$tr('welcomeModalContentDescription'),
            this.$tr('welcomeModalPermissionsDescription'),
          ];
        }
      },
    },

    render: createElement => window.setTimeout(createElement, 750),
    $trs: {
      welcomeModalHeader: {
        message: 'Welcome to Kolibri!',
        context: 'Title of welcome window which displays on first sign in as a super admin.',
      },
      welcomeModalContentDescription: {
        message: 'The first thing you should do is import some resources from the Channels tab.',
        context:
          'Text that appears on welcome window when a super admin sets up a facility for the first time.',
      },
      welcomeModalPermissionsDescription: {
        message:
          'The super admin account you created during setup has special permissions to do this. Learn more in the Permissions tab later.',
        context:
          'Text that appears on welcome window when a super admin sets up a facility for the first time.\n',
      },
      postSyncWelcomeMessage1: {
        message: 'The first thing you should do is import some channels to this device.',
        context: 'Welcome message for user which appears if there are no channels on the device.',
      },
      postSyncWelcomeMessage2: {
        message: `The learner reports, lessons, and quizzes in '{facilityName}' will not display properly until you import the resources associated with them.`,
        context: 'Welcome message for user indicating that they need to import resources.',
      },
      learnOnlyDeviceWelcomeMessage1: {
        message: 'The first thing you should do is import some channels to this device',
        context: 'Welcome message for user which appears after provisioning a Learner Only Device.',
      },
      learnOnlyDeviceWelcomeMessage2: {
        message: `The user reports, lessons, and quizzes will not display properly until you import the resources associated with them.`,
        context: 'Welcome message for user indicating that they need to import resources.',
      },
    },
  };

</script>


<style lang="scss" scoped>

  .paragraph {
    margin-top: 16px;
  }

</style>
